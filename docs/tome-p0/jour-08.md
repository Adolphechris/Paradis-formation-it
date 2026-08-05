# SEMESTRE 1 — Jour 08 (6h) : Windows 11 & Server 2025 Administration

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'environnement d'administration natif de Windows, savoir diagnostiquer des pannes via les événements et gérer finement les utilisateurs locaux et le registre.
> **Compétences visées** : `BIT-03` (Niveau Cible: A) — Administration Windows et outils système.

---

## 1) Interfaces d'administration (MMC, Gestionnaire, Événements) (2h00)

### 📖 1.1 Narration & Intuition
Sous Linux, tout est fichier. Sous Windows, l'administration est orientée *objets et consoles*. Plutôt que de lire des logs dans `/var/log`, Windows centralise tout dans l'Observateur d'événements. Plutôt que de modifier des fichiers texte, Microsoft a créé la MMC (Microsoft Management Console), un "cadre" dans lequel on clipse des outils (composants logiciels enfichables) pour gérer les disques, les utilisateurs, ou les certificats.

### 🔍 1.2 Anatomie Technique
- **MMC (`mmc.exe`)** : Le conteneur générique. Fichiers en `.msc` (ex: `compmgmt.msc` pour la gestion de l'ordinateur).
- **Taskmgr (`taskmgr.exe`)** : Gestionnaire des tâches. Permet de voir les processus, l'impact au démarrage, les services.
- **EventVwr (`eventvwr.msc`)** : Observateur d'événements. Structuré en journaux : Application, Sécurité, Système.

### 🛠️ 1.3 Atelier Pratique Hands-on
```powershell
# (À exécuter dans un terminal PowerShell ou CMD sur Windows)
# Lancer la Gestion de l'ordinateur directement
compmgmt.msc

# Lancer l'Observateur d'événements
eventvwr.msc

# Créer une MMC personnalisée en ligne de commande (lance une MMC vide)
mmc.exe
# -> Fichier > Ajouter/Supprimer un composant logiciel enfichable > Ajouter "Observateur d'événements" et "Services"
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : Une application crashe aléatoirement.
**Réflexe** : Ouvrir `eventvwr.msc`. Aller dans Journaux Windows > Application. Filtrer par le niveau "Erreur". Regarder l'Event ID (ID d'événement) pour le rechercher sur Google.

---

## 2) La Base de Registre (Regedit) (2h00)

### 📖 2.1 Narration & Intuition
La base de registre est le cerveau ou l'ADN de Windows. C'est une immense base de données hiérarchique qui remplace les milliers de fichiers `.conf` d'un système Linux. Chaque application, chaque pilote, chaque préférence utilisateur (fond d'écran, langue) y est stocké. C'est puissant, mais une erreur de modification peut paralyser tout le système.

### 🔍 2.2 Anatomie Technique
Structurée en "Ruches" (Hives) :
- `HKEY_LOCAL_MACHINE` (HKLM) : Paramètres de l'ordinateur (global).
- `HKEY_CURRENT_USER` (HKCU) : Paramètres de l'utilisateur actuellement connecté.
- **Clés** (comme des dossiers) et **Valeurs** (comme des fichiers : Chaîne, DWORD 32 bits, etc.).

### 🛠️ 2.3 Atelier Pratique Hands-on
```powershell
# Ouvrir l'éditeur graphique (Nécessite des droits d'admin pour HKLM)
regedit.exe

# Interroger une clé en ligne de commande (CMD/PowerShell)
# Ex: Voir les logiciels lancés au démarrage pour la machine entière
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

# Ex: Voir la version exacte de Windows
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v ProductName
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : Un malware se lance tout seul à chaque redémarrage même après avoir supprimé son raccourci.
**Réflexe** : Vérifier les clés de registre `Run` et `RunOnce` dans HKLM et HKCU pour supprimer la valeur qui pointe vers l'exécutable malveillant.

---

## 3) Gestion des Utilisateurs et Groupes Locaux (2h00)

### 📖 3.1 Narration & Intuition
Windows sépare rigoureusement l'utilisateur standard de l'administrateur (via l'UAC - User Account Control). Même si vous êtes dans le groupe Administrateurs, vous travaillez avec des droits standards jusqu'à ce que vous validiez l'élévation de privilèges. Comprendre comment créer des utilisateurs isolés et gérer l'appartenance au groupe Administrateurs est la base de la sécurité locale (avant même d'aborder l'Active Directory).

### 🔍 3.2 Anatomie Technique
- Interface GUI : `lusrmgr.msc` (Utilisateurs et groupes locaux).
- Les SID (Security Identifiers) : Sous le capot, Windows ne connaît pas le nom "Jean", il connaît le SID "S-1-5-21-XXX-XXX".
- Groupes clés : `Administrateurs`, `Utilisateurs`, `Utilisateurs du Bureau à distance`.

### 🛠️ 3.3 Atelier Pratique Hands-on
```powershell
# Lancer l'interface graphique (sur les versions Pro/Enterprise)
lusrmgr.msc

# Créer un utilisateur en ligne de commande (cmd ou PS admin)
net user stagiaire "P@ssw0rd123!" /add

# Ajouter cet utilisateur au groupe Administrateurs
net localgroup Administrateurs stagiaire /add

# Lister les membres du groupe Administrateurs
net localgroup Administrateurs

# Supprimer l'utilisateur
net user stagiaire /delete
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : Vous n'arrivez pas à exécuter une action nécessitant des droits, et le terminal vous dit "Accès refusé".
**Réflexe** : Vérifiez que vous avez ouvert le terminal "En tant qu'administrateur" (Élévation UAC). En PowerShell, on peut vérifier avec : `(New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Audit basique Windows
- **Consigne** : Trouvez l'ID d'événement (Event ID) correspondant au dernier démarrage du service de temps (Windows Time). Ensuite, créez un compte local nommé `AuditAdmin` et placez-le dans le groupe `Administrateurs`.
- **Livrables à produire** : Capture d'écran de l'Event Viewer avec le filtre appliqué. Capture d'écran du terminal après les commandes.
- **Corrigé détaillé & Guidé** :
  1. Win+R -> `eventvwr.msc`
  2. Système -> Filtrer le journal actuel -> Source des événements : `Time-Service`.
  3. En console Admin : `net user AuditAdmin "AdminP@ss!" /add`
  4. `net localgroup Administrateurs AuditAdmin /add`

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle console permet de gérer les disques, les utilisateurs et l'observateur d'événements au même endroit ?
A) `regedit.exe`
B) `compmgmt.msc`
C) `taskmgr.exe`
D) `services.msc`
*Réponse : B*

2. QCM: Que signifie HKLM dans la base de registre ?
A) HKEY_LOCAL_MACHINE
B) HIGH_KEY_LOCAL_MANAGER
C) HKEY_LIST_MAIN
D) HOST_KEY_LOGIN_MANAGER
*Réponse : A*

3. QCM: Quel est le rôle de l'UAC (User Account Control) ?
A) Bloquer les virus par signature
B) Demander une confirmation explicite avant d'utiliser les droits d'administrateur
C) Mettre à jour Windows
D) Gérer les mots de passe réseau
*Réponse : B*

4. QCM: Quelle commande en ligne permet de lister les membres du groupe Administrateurs local ?
A) `Get-Admin`
B) `lsgroup admin`
C) `net localgroup Administrateurs`
D) `whoami /admin`
*Réponse : C*

5. QCM: Sous quel format Windows stocke-t-il les paramètres d'application et de système ?
A) Des fichiers `.conf` texte uniquement
B) La Base de Registre
C) Le dossier System32
D) L'Observateur d'événements
*Réponse : B*
