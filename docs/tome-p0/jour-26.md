# SEMESTRE 1 — Jour 26 (6h) : PowerShell Avancé — Scripting WMI/CIM & AD Module

> [!NOTE]
> **Objectif de la journée** : Interroger l'infrastructure Windows et automatiser l'administration de l'Active Directory via des scripts PowerShell robustes.
> **Compétences visées** : `BIT-03` (A), `BIT-05` (A) — PowerShell avancé et administration AD.

---

## 1) WMI et CIM : L'interface de gestion de l'OS (2h00)

### 📖 1.1 Narration & Intuition
Comment PowerShell sait-il quel est le modèle de votre processeur, ou l'espace libre sur votre disque C: ? Il n'invente rien, il interroge le "WMI" (Windows Management Instrumentation) ou son successeur "CIM" (Common Information Model). C'est une immense base de données d'informations systèmes. Pensez à WMI/CIM comme à l'API interne du système d'exploitation Windows. En interrogeant ces classes (ex: `Win32_OperatingSystem`), vous pouvez auditer des milliers de machines à distance.

### 🔍 1.2 Anatomie Technique
- **WMI** est l'ancienne technologie de Microsoft (utilise DCOM, lourd, pose des problèmes avec les pare-feux). `Get-WmiObject` est obsolète depuis PowerShell v3.
- **CIM** est le standard ouvert (utilise WS-Man via HTTP/HTTPS). `Get-CimInstance` est la norme actuelle. C'est plus rapide et beaucoup plus adapté aux réseaux sécurisés.
Les informations sont organisées en *Classes* (ex: `Win32_Bios`, `Win32_LogicalDisk`).

### 🛠️ 1.3 Atelier Pratique Hands-on
Interrogation de classes CIM.
```powershell
# Obtenir des informations sur le système d'exploitation
Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object Caption, Version, LastBootUpTime

# Auditer l'espace libre des disques durs locaux (DriveType 3)
Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType = 3" | 
    Select-Object DeviceID, 
                  @{Name="Size(GB)";Expression={[math]::Round($_.Size / 1GB, 2)}},
                  @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace / 1GB, 2)}}

# Interroger une machine distante (Nécessite WinRM configuré)
Get-CimInstance -ClassName Win32_ComputerSystem -ComputerName "SRV-FILE-01"
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **"RPC Server is unavailable"** ou erreurs DCOM avec WMI/CIM à distance : Cela signifie que le pare-feu du poste distant bloque les requêtes. Activez le Remote Management (`Enable-PSRemoting -Force`) sur la cible pour ouvrir les ports WinRM (TCP 5985/5986) pour CIM.

---

## 2) Module Active Directory : Requêtes avancées (2h00)

### 📖 2.1 Narration & Intuition
Pour manipuler l'Active Directory, vous avez besoin du module `ActiveDirectory`. C'est une extension de PowerShell (un "plugin") qui ajoute des commandes spécifiques (cmdlets) comme `Get-ADUser` ou `Set-ADGroup`. C'est l'outil privilégié pour nettoyer un annuaire (ex: trouver les comptes inactifs depuis 90 jours) ou extraire des rapports.

### 🔍 2.2 Anatomie Technique
Les commandes AD sont très performantes car elles filtrent les données directement sur le serveur (`-Filter`) plutôt que de ramener toute la base et de la trier localement (`| Where-Object`).
Par défaut, `Get-ADUser` ne ramène que les attributs de base (nom, UPN, DN). Pour obtenir la date de dernière connexion ou le département, il faut utiliser le paramètre `-Properties`.

### 🛠️ 2.3 Atelier Pratique Hands-on
Recherche et extraction de données AD.
```powershell
# Importation (souvent automatique dans PS 5.1+)
Import-Module ActiveDirectory

# 1. Obtenir les détails spécifiques d'un utilisateur
Get-ADUser -Identity "Administrator" -Properties Description, PasswordLastSet, LastLogonDate

# 2. Trouver tous les utilisateurs du département "RH"
Get-ADUser -Filter {Department -eq "RH"} -Properties Department, Title

# 3. Trouver les comptes inactifs depuis plus de 90 jours
$dateLimite = (Get-Date).AddDays(-90)
Get-ADUser -Filter {LastLogonDate -lt $dateLimite -and Enabled -eq $true} -Properties LastLogonDate | 
    Select-Object Name, LastLogonDate, sAMAccountName
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **"Cannot validate argument on parameter 'Identity'."** : L'objet AD demandé n'existe pas ou le nom (sAMAccountName) est mal orthographié. Toujours valider qu'on utilise un identifiant unique (sAMAccountName ou GUID) avec `-Identity`.

---

## 3) Scripting : Automatisation du Onboarding (2h00)

### 📖 3.1 Narration & Intuition
Chaque semaine, l'entreprise embauche 10 nouvelles personnes. Les RH vous envoient un fichier CSV (Excel). Créer ces 10 comptes à la main prend 30 minutes, avec un fort risque de faire des fautes de frappe. Un script PowerShell d'Onboarding lira le CSV, génèrera le mot de passe, créera le compte avec la bonne OU, et ajoutera l'utilisateur aux bons groupes en 2 secondes.

### 🔍 3.2 Anatomie Technique
La boucle `ForEach` couplée à `Import-Csv` est la pierre angulaire du scripting système.
```csv
# Exemple de fichier employes.csv
Prenom,Nom,Departement
Jean,Dupont,IT
Marie,Curie,Recherche
```

### 🛠️ 3.3 Atelier Pratique Hands-on
Script complet d'importation CSV.
```powershell
# 1. Créer le CSV de test (en mémoire pour l'exemple)
@"
Prenom,Nom,Departement,OUPath
Luc,Skywalker,IT,OU=IT,OU=Entreprise,DC=paradis,DC=local
"@ > employes.csv

# 2. Le script d'onboarding
$users = Import-Csv -Path "employes.csv"
$securePass = ConvertTo-SecureString "P@ssw0rd2025!!" -AsPlainText -Force

foreach ($u in $users) {
    # Générer le nom d'utilisateur (Première lettre prénom + Nom)
    $sam = "$($u.Prenom.Substring(0,1))$($u.Nom)".ToLower()
    
    Write-Host "Création de $sam..." -ForegroundColor Cyan
    
    # Création du compte
    New-ADUser -Name "$($u.Prenom) $($u.Nom)" `
               -GivenName $u.Prenom `
               -Surname $u.Nom `
               -sAMAccountName $sam `
               -UserPrincipalName "$sam@paradis.local" `
               -Path $u.OUPath `
               -AccountPassword $securePass `
               -Department $u.Departement `
               -Enabled $true
}
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Gestion des erreurs et doublons** : Si `jdupont` existe déjà, le script plantera (rouge). Il faut tester la présence avant création avec `try { Get-ADUser -Identity $sam; Write-Warning "Existe déjà" } catch { ...Création... }`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Auditeur de Sécurité AD
- **Consigne** : Écrivez un script PowerShell qui génère un rapport de sécurité : il doit lister tous les utilisateurs membres du groupe "Domain Admins" et exporter ce résultat dans un fichier `Rapport-Admins.csv` incluant le nom de l'utilisateur et son statut (Activé ou Désactivé).
- **Livrables à produire** : Le script `.ps1` et le fichier `Rapport-Admins.csv` généré.
- **Corrigé détaillé & Guidé** :
```powershell
# Récupérer les membres du groupe
$membres = Get-ADGroupMember -Identity "Domain Admins"

# Créer un tableau pour stocker les résultats formatés
$resultats = foreach ($membre in $membres) {
    # On exclut les sous-groupes, on ne veut que les utilisateurs
    if ($membre.ObjectClass -eq "user") {
        # Get-ADUser pour récupérer l'attribut Enabled
        $userDetail = Get-ADUser -Identity $membre.sAMAccountName -Properties Enabled
        
        # Construire un objet personnalisé
        [PSCustomObject]@{
            NomUtilisateur = $userDetail.Name
            CompteActif    = $userDetail.Enabled
            Login          = $userDetail.sAMAccountName
        }
    }
}

# Exporter en CSV
$resultats | Export-Csv -Path "Rapport-Admins.csv" -NoTypeInformation -Encoding UTF8
Write-Host "Le rapport a été généré avec succès."
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Pourquoi préfère-t-on Get-CimInstance à Get-WmiObject ?
   A) Il consomme moins de RAM
   B) C'est l'ancien nom de WMI
   C) Il utilise les protocoles modernes (WS-Man) au lieu de DCOM
   D) Il permet de pirater le système
   *Réponse : C*

2. QCM: Quel paramètre de Get-ADUser est indispensable pour récupérer un attribut non affiché par défaut, comme la description ou la date de dernière connexion ?
   A) -ShowAll
   B) -Properties
   C) -Select
   D) -Detail
   *Réponse : B*

3. QCM: Pour parcourir chaque ligne d'un fichier CSV importé, quelle boucle PowerShell utilise-t-on le plus souvent ?
   A) For
   B) While
   C) Do-Until
   D) ForEach
   *Réponse : D*

4. QCM: Que fait le paramètre `-Filter` dans la commande `Get-ADUser -Filter {Enabled -eq $true}` ?
   A) Il télécharge toute la base et filtre sur le PC client
   B) Il demande au contrôleur de domaine de ne renvoyer que les comptes activés, optimisant le réseau
   C) Il masque l'erreur si la commande échoue
   D) Il supprime les comptes activés
   *Réponse : B*

5. QCM: Quelle cmdlet permet d'ajouter un membre dans un groupe AD ?
   A) Add-ADGroupMember
   B) Set-ADUserGroup
   C) New-ADMembership
   D) Update-ADGroup
   *Réponse : A*
