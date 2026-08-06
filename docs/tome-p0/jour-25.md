# SEMESTRE 1 — Jour 25 (6h) : Active Directory — GPO & Sécurité des Accès

> [!NOTE]
> **Objectif de la journée** : Sécuriser les accès et automatiser la configuration des postes clients/serveurs à l'aide des stratégies de groupe (GPO) et des protocoles d'authentification.
> **Compétences visées** : `BIT-03` (A), `SEC-03` (A) — GPO et sécurité Active Directory.

---

## 1) Introduction aux Stratégies de Groupe (GPO) (2h00)

### 📖 1.1 Narration & Intuition
Vous gérez 500 ordinateurs. Comment vous assurez-vous que tous les utilisateurs ont un fond d'écran d'entreprise, qu'ils ne peuvent pas accéder au Panneau de configuration, et que leurs ordinateurs se verrouillent après 15 minutes d'inactivité ? Le faire manuellement prendrait des mois. Les **GPO (Group Policy Objects)** permettent d'appliquer instantanément et automatiquement ces configurations à des groupes d'utilisateurs ou d'ordinateurs dans l'Active Directory. C'est l'outil de gestion de parc ultime de l'écosystème Windows.

### 🔍 1.2 Anatomie Technique
Un GPO est composé de deux parties :
- **Group Policy Container (GPC)** : Les métadonnées stockées dans la base AD.
- **Group Policy Template (GPT)** : Les fichiers physiques (fichiers `.pol`, scripts de démarrage) stockés sur le DC dans un dossier partagé appelé `SYSVOL` (`\\paradis.local\sysvol\`).
Les GPOs sont liés à des niveaux précis : Site, Domaine, ou OU (Règle d'application LSDOU : Local, Site, Domain, OU). Un GPO lié à une OU s'appliquera à tous les objets qu'elle contient.

### 🛠️ 1.3 Atelier Pratique Hands-on
Création d'un GPO basique via la console Group Policy Management (`gpmc.msc`) ou PowerShell.
```powershell
# 1. Créer un nouveau GPO
New-GPO -Name "SEC-Verrouillage-Session"

# 2. Lier le GPO à l'OU IT
New-GPLink -Name "SEC-Verrouillage-Session" -Target "OU=IT,OU=Entreprise,DC=paradis,DC=local"

# Pour éditer concrètement les paramètres, on utilise généralement gpmc.msc
# (Ex: Configuration Utilisateur > Stratégies > Modèles d'administration > Panneau de config...)
# On peut forcer l'application de la GPO sur un client avec :
gpupdate /force
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Le GPO ne s'applique pas** : Sur le poste client, lancez `gpresult /r` (ou `gpresult /h report.html`) pour voir les GPO appliqués. Souvent, le problème vient du fait que l'ordinateur est dans la mauvaise OU, ou d'un conflit "d'héritage" (un autre GPO bloque l'application).

---

## 2) Authentification : Kerberos vs NTLM et Audits (2h00)

### 📖 2.1 Narration & Intuition
Quand un utilisateur tape son mot de passe, comment le contrôleur de domaine (DC) vérifie-t-il sans que des hackers interceptent le mot de passe sur le réseau ? Dans le monde Windows, le protocole historique est **NTLM** (basé sur un système de "challenge/réponse"), mais il est vieillissant et vulnérable (attaques Pass-the-Hash). Le standard moderne et sécurisé est **Kerberos**, qui fonctionne avec un système de "tickets", comme des billets de cinéma valables un temps limité.

### 🔍 2.2 Anatomie Technique
- **Kerberos** : Le DC agit en tant que KDC (Key Distribution Center). L'utilisateur obtient un TGT (Ticket Granting Ticket) prouvant son identité, puis demande des TGS (Ticket Granting Service) pour accéder à un service spécifique (ex: serveur de fichiers). Kerberos nécessite une synchronisation temporelle stricte et DNS.
- **NTLMv2** : Est conservé pour des raisons de rétrocompatibilité (ex: accès IP direct, ou si le DNS échoue).
- **Audit** : L'AD permet d'enregistrer toutes les tentatives de connexion (réussies/échouées) dans les journaux d'événements de sécurité (Event Viewer).

### 🛠️ 2.3 Atelier Pratique Hands-on
Activation de l'audit des connexions via GPO.
```powershell
# L'audit des comptes doit être activé dans la stratégie par défaut du domaine ("Default Domain Policy")
# ou dans la stratégie des contrôleurs de domaine ("Default Domain Controllers Policy").
# Chemin GPMC : Computer Configuration -> Policies -> Windows Settings -> Security Settings -> Local Policies -> Audit Policy

# Depuis un poste, afficher les logs de sécurité (ID 4624 : Connexion réussie, ID 4625 : Échec)
Get-EventLog -LogName Security -InstanceId 4624 -Newest 5
# ou avec la nouvelle cmdlet :
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 5
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **SPN manquants** : Si Kerberos échoue, l'authentification tombe en NTLM (fallback). Cela arrive souvent si le "Service Principal Name" (SPN) du service cible n'est pas correctement configuré. L'outil `setspn.exe` permet de vérifier et d'ajouter les SPN.

---

## 3) Stratégies de Mots de Passe & Verrouillage (2h00)

### 📖 3.1 Narration & Intuition
Si un pirate trouve un compte, il peut lancer une attaque par force brute (essayer des milliers de mots de passe). Pour bloquer cela, nous devons exiger des mots de passe complexes et verrouiller (Lockout) un compte après X tentatives échouées. Dans un domaine AD, cette règle globale s'appelle la "Default Domain Policy".

### 🔍 3.2 Anatomie Technique
Historiquement, on ne pouvait avoir qu'une seule stratégie de mot de passe par domaine. Depuis Windows Server 2008, on peut utiliser des **FGPP (Fine-Grained Password Policies)** (PSO - Password Settings Objects) pour assigner une politique de mot de passe très stricte aux Administrateurs, et une politique standard aux utilisateurs normaux.

### 🛠️ 3.3 Atelier Pratique Hands-on
Configuration d'une FGPP pour les administrateurs avec PowerShell.
```powershell
# Créer une stratégie de mot de passe stricte : min 12 caractères, historique de 24, verrouillage après 3 échecs
New-ADFineGrainedPasswordPolicy -Name "FGPP-Admins-Stricte" -Precedence 10 `
  -ComplexityEnabled $true -MinPasswordLength 12 `
  -PasswordHistoryCount 24 -MaxPasswordAge (New-TimeSpan -Days 60) `
  -LockoutDuration (New-TimeSpan -Minutes 30) `
  -LockoutObservationWindow (New-TimeSpan -Minutes 15) `
  -LockoutThreshold 3

# Appliquer cette stratégie au groupe des Administrateurs du domaine
Add-ADFineGrainedPasswordPolicySubject -Identity "FGPP-Admins-Stricte" -Subjects "Domain Admins"

# Vérifier la stratégie qui s'applique à un utilisateur
Get-ADUserResultantPasswordPolicy -Identity "Administrator"
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **L'utilisateur se bloque tout seul** : Souvent, un utilisateur change son mot de passe sur le PC, mais son smartphone essaie toujours de se synchroniser à l'Exchange avec l'ancien mot de passe, ce qui provoque des échecs d'authentification et verrouille le compte en boucle (Lockout storm).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Restreindre l'accès au Panneau de Configuration
- **Consigne** : Créez une GPO nommée "Client-Restrictions" qui empêche l'accès au panneau de configuration. Liez cette GPO à l'OU "RH".
- **Livrables à produire** : Capture d'écran du rapport GPMC montrant la GPO liée, et une capture d'un client de l'OU RH tentant d'ouvrir `control.exe` avec le message d'erreur.
- **Corrigé détaillé & Guidé** :
  1. Ouvrez `gpmc.msc`.
  2. Allez dans *Group Policy Objects* -> Click droit *New* -> "Client-Restrictions".
  3. Edit -> User Configuration -> Policies -> Administrative Templates -> Control Panel.
  4. Activez (Enabled) la stratégie "Prohibit access to Control Panel and PC settings".
  5. Glissez-déposez la GPO sur l'OU "RH".
  6. Sur le PC client connecté en tant qu'utilisateur RH, tapez `gpupdate /force`, puis essayez d'ouvrir le Panneau de configuration.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle commande affiche les GPOs appliqués sur une machine locale ?
   A) Get-GPO
   B) gpresult /r
   C) gpupdate /force
   D) gpedit.msc
   *Réponse : B*

2. QCM: Où sont stockés physiquement les fichiers (modèles administratifs, scripts) d'une GPO sur un contrôleur de domaine ?
   A) C:\Windows\System32
   B) Dans la partition Active Directory
   C) Dans le dossier partagé SYSVOL
   D) Dans le dossier NETLOGON
   *Réponse : C*

3. QCM: Quel protocole d'authentification AD moderne utilise un système de tickets (TGT/TGS) ?
   A) NTLM
   B) RADIUS
   C) LDAP
   D) Kerberos
   *Réponse : D*

4. QCM: L'Event ID 4625 dans le journal de Sécurité indique :
   A) Un verrouillage de compte
   B) Un changement de mot de passe
   C) Une connexion réussie
   D) Un échec de connexion (Logon failure)
   *Réponse : D*

5. QCM: Que signifie FGPP ?
   A) First Group Policy Processing
   B) Fine-Grained Password Policy
   C) Full Global Permission Protocol
   D) Fast Group Policy Push
   *Réponse : B*
