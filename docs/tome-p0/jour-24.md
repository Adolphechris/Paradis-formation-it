# SEMESTRE 1 — Jour 24 (6h) : Windows Server 2025 — Active Directory Domain Services (AD DS)

> [!NOTE]
> **Objectif de la journée** : Déployer et configurer un domaine Active Directory pour centraliser la gestion des utilisateurs, groupes et ordinateurs dans une infrastructure d'entreprise.
> **Compétences visées** : `BIT-03` (Niveau Cible: A) — Active Directory DS et identités Windows.

---

## 1) Concepts Fondamentaux et Promotion AD DS (2h00)

### 📖 1.1 Narration & Intuition
Imaginez une entreprise avec 500 employés. Si vous deviez créer un compte utilisateur localement sur chaque ordinateur pour que les gens puissent travailler, ce serait l'enfer. Si un employé change de mot de passe, il faudrait le changer partout. **Active Directory (AD)** est la solution : c'est un énorme annuaire téléphonique (et coffre-fort) central. Une fois qu'un utilisateur est authentifié par le "Contrôleur de Domaine" (DC), il peut accéder aux ressources de tout le réseau ("Domaine"). L'ordinateur devient membre du domaine, et fait confiance au DC.

### 🔍 1.2 Anatomie Technique
L'Active Directory s'appuie sur trois concepts clés :
- **Domaine** : Une frontière logique de sécurité et d'administration (ex: `paradis.local`).
- **Forêt** : Un regroupement de un ou plusieurs domaines partageant un schéma commun.
- **Contrôleur de Domaine (DC)** : Le serveur Windows qui héberge la base de données AD (le fichier `NTDS.DIT`) et traite les demandes d'authentification.
Lorsqu'on installe le rôle AD DS, le serveur est "promu" en DC. L'AD repose lourdement sur **DNS** pour la résolution des noms et la localisation des services (SRV records).

### 🛠️ 1.3 Atelier Pratique Hands-on
Installation du rôle AD DS et promotion via PowerShell (en tant qu'Administrateur).
```powershell
# 1. Installer la fonctionnalité AD DS et ses outils de gestion
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# 2. Promouvoir le serveur en tant que premier DC d'une nouvelle forêt
Install-ADDSForest -DomainName "paradis.local" -DomainMode "WinThreshold" -ForestMode "WinThreshold" -InstallDns:$true -Force:$true

# Le serveur va redémarrer automatiquement après la promotion.
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Pannes DNS** : "Impossible de joindre le domaine". 90% des problèmes AD sont des problèmes DNS. Vérifiez que la machine cliente a bien l'IP du DC comme serveur DNS primaire (`ipconfig /all`).
- **Désynchronisation temporelle** : L'authentification (Kerberos) échoue si l'écart de temps entre le client et le serveur dépasse 5 minutes. Configurez le DC pour se synchroniser sur une source NTP fiable (ex: `w32tm /config /syncfromflags:manual /manualpeerlist:pool.ntp.org /update`).

---

## 2) Structure Logique : Unités d'Organisation (OU) (1h30)

### 📖 2.1 Narration & Intuition
Mettre tous les employés dans un même dossier serait chaotique. Dans l'AD, nous organisons les objets (utilisateurs, ordinateurs) dans des "Unités d'Organisation" (OU). Pensez aux OU comme aux départements de votre entreprise (RH, IT, Compta). Cela permet de déléguer l'administration (ex: le chef IT gère l'OU IT) et d'appliquer des stratégies (GPO) spécifiques à certains groupes.

### 🔍 2.2 Anatomie Technique
Les OU sont des conteneurs AD (différents des simples "Containers" par défaut comme `CN=Users`). Une OU peut contenir d'autres OU (imbrication). Le nom distinctif (Distinguished Name, DN) définit le chemin exact d'un objet. Exemple : `OU=IT,DC=paradis,DC=local`.

### 🛠️ 1.3 Atelier Pratique Hands-on
Création d'OUs via la console ou PowerShell.
```powershell
# Créer une OU racine "Entreprise"
New-ADOrganizationalUnit -Name "Entreprise" -Path "DC=paradis,DC=local"

# Créer des sous-OUs pour IT et RH
New-ADOrganizationalUnit -Name "IT" -Path "OU=Entreprise,DC=paradis,DC=local"
New-ADOrganizationalUnit -Name "RH" -Path "OU=Entreprise,DC=paradis,DC=local"

# Lister les OUs créées
Get-ADOrganizationalUnit -Filter * -SearchBase "OU=Entreprise,DC=paradis,DC=local"
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Suppression accidentelle** : Par défaut, PowerShell et l'interface graphique protègent les OUs contre la suppression accidentelle. Pour supprimer une OU, il faut d'abord décocher cette option (`Set-ADOrganizationalUnit -Identity "OU=..." -ProtectedFromAccidentalDeletion $false`).

---

## 3) Gestion des Utilisateurs et Groupes de Sécurité (2h30)

### 📖 3.1 Narration & Intuition
Maintenant que notre "bâtiment" (Domaine) et nos "étages" (OUs) sont prêts, nous allons y placer nos "employés" (Comptes Utilisateurs). Mais comment gérer les permissions d'accès au serveur de fichiers par exemple ? On ne donne jamais de droits directement à un utilisateur, on donne les droits à un "Groupe", et on ajoute l'utilisateur dans ce groupe. C'est l'approche RBAC (Role-Based Access Control).

### 🔍 3.2 Anatomie Technique
- **User Object** : Contient le nom d'utilisateur (sAMAccountName, ex: `jdoe`), l'UPN (User Principal Name, ex: `jdoe@paradis.local`), le mot de passe et l'état d'activation.
- **Security Group** : Utilisé pour attribuer des permissions. Il a une "portée" (Globale, Universelle, ou Domaine Locale). La règle d'or d'intégration est AGDLP (Accounts -> Global groups -> Domain Local groups -> Permissions).

### 🛠️ 3.3 Atelier Pratique Hands-on
Création d'utilisateurs et de groupes.
```powershell
# 1. Créer un utilisateur dans l'OU IT
$securePassword = ConvertTo-SecureString "Paradis2025!" -AsPlainText -Force
New-ADUser -Name "Alice Admin" -GivenName "Alice" -Surname "Admin" -sAMAccountName "aadmin" -UserPrincipalName "aadmin@paradis.local" -Path "OU=IT,OU=Entreprise,DC=paradis,DC=local" -AccountPassword $securePassword -Enabled $true

# 2. Créer un groupe de sécurité Global
New-ADGroup -Name "GG-Admins-Systemes" -GroupCategory Security -GroupScope Global -Path "OU=IT,OU=Entreprise,DC=paradis,DC=local"

# 3. Ajouter Alice au groupe
Add-ADGroupMember -Identity "GG-Admins-Systemes" -Members "aadmin"

# Vérifier l'appartenance
Get-ADPrincipalGroupMembership -Identity "aadmin" | Select-Object Name
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Compte verrouillé** : Un utilisateur a tapé le mauvais mot de passe trop de fois. Utilisez `Unlock-ADAccount -Identity "jdoe"` pour déverrouiller.
- **Attribut caché** : Dans la console graphique `dsa.msc` (Active Directory Users and Computers), activez l'onglet "View > Advanced Features" pour voir l'onglet de sécurité (Security) et l'éditeur d'attributs (Attribute Editor) sur les objets.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Intégration d'une machine au domaine
- **Consigne** : Déployez une machine virtuelle Windows 10/11 ou Windows Server. Configurez son DNS pour pointer vers l'IP de votre contrôleur de domaine, puis joignez la machine au domaine `paradis.local`.
- **Livrables à produire** : Capture d'écran des paramètres système affichant le nom complet de l'ordinateur incluant le domaine, et confirmation du redémarrage.
- **Corrigé détaillé & Guidé** :
```powershell
# Sur la machine cliente (en tant qu'Administrateur local) :
# 1. Configurer l'IP DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("192.168.1.100") # Remplacer par l'IP du DC

# 2. Joindre le domaine
Add-Computer -DomainName "paradis.local" -Credential "paradis\Administrator" -Restart
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quel service est absolument vital pour le bon fonctionnement d'Active Directory ?
   A) DHCP
   B) DNS
   C) IIS
   D) WDS
   *Réponse : B*

2. QCM: Quelle commande PowerShell est utilisée pour installer le rôle AD DS ?
   A) Install-WindowsFeature AD-Domain-Services
   B) Add-ADDS
   C) Enable-WindowsRole AD
   D) Setup-ADDomain
   *Réponse : A*

3. QCM: Quel est le format d'un Distinguished Name (DN) pour l'utilisateur John Doe dans l'OU Sales du domaine corp.local ?
   A) CN=John Doe,OU=Sales,DC=corp,DC=local
   B) OU=Sales,CN=John Doe,DC=corp,DC=local
   C) DC=corp,DC=local,OU=Sales,CN=John Doe
   D) CN=John Doe,DC=corp,DC=local,OU=Sales
   *Réponse : A*

4. QCM: Comment déverrouiller un compte utilisateur avec PowerShell ?
   A) Set-ADUser -Identity "user" -Locked $false
   B) Unlock-ADAccount -Identity "user"
   C) Enable-ADAccount -Identity "user"
   D) Reset-ADUserLock "user"
   *Réponse : B*

5. QCM: Pourquoi utilise-t-on des Unités d'Organisation (OU) ?
   A) Pour attribuer des adresses IP
   B) Pour structurer l'annuaire, déléguer l'administration et appliquer des GPO
   C) Pour accélérer la réplication
   D) Pour créer des sites de sauvegarde
   *Réponse : B*
