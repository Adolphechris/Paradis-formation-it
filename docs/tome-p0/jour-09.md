# SEMESTRE 1 — Jour 09 (6h) : PowerShell Fondamentaux & Automation

> [!NOTE]
> **Objectif de la journée** : Comprendre la philosophie orientée objet de PowerShell, manipuler les pipelines, et écrire ses premiers scripts pour automatiser les tâches d'administration.
> **Compétences visées** : `BIT-03` (A), `BIT-05` (Niveau Cible: A) — PowerShell et automatisation Windows.

---

## 1) Objets vs Texte & Cmdlets de base (2h00)

### 📖 1.1 Narration & Intuition
Quand vous lancez une commande sous Linux (Bash), elle recrache du texte. Pour extraire la mémoire d'un processus, il faut utiliser `grep`, `awk` ou `cut` pour découper la chaîne de caractères. En PowerShell, c'est une révolution : les commandes renvoient des **Objets**. C'est comme manipuler des boîtes structurées avec des étiquettes (Propriétés) et des boutons (Méthodes). Vous n'avez pas besoin de découper du texte, vous demandez simplement la propriété `.Name` ou `.CPU`.

### 🔍 1.2 Anatomie Technique
- **Cmdlet** : Une commande native PowerShell, structurée en `Verbe-Nom` (ex: `Get-Process`, `Stop-Service`).
- **Objets .NET** : Tout élément en PowerShell hérite du framework .NET.
- **ExecutionPolicy** : Par défaut, Windows bloque l'exécution des scripts (`.ps1`) pour la sécurité. Il faut le déverrouiller.

### 🛠️ 1.3 Atelier Pratique Hands-on
```powershell
# Découvrir les propriétés d'un objet processus
Get-Process | Get-Member

# Voir l'état des services
Get-Service

# Gérer la politique d'exécution (en mode Administrateur)
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Force
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : "Impossible de charger le fichier script.ps1 car l'exécution de scripts est désactivée sur ce système."
**Réflexe** : C'est le blocage classique `Restricted`. Lancez PowerShell en admin et tapez `Set-ExecutionPolicy RemoteSigned` (autorise les scripts locaux, exige une signature pour les scripts téléchargés).

---

## 2) Le Pipeline PowerShell (Le "Tire-ligne" Magique) (2h00)

### 📖 2.1 Narration & Intuition
Le pipeline (le symbole `|` , barre verticale) est un tapis roulant d'usine. La première machine extrait des processus (les boîtes). Elle les pose sur le tapis roulant. La machine suivante filtre les boîtes trop légères (`Where-Object`). La machine d'après extrait juste le nom inscrit sur la boîte (`Select-Object`). Enfin, la dernière trie le tout (`Sort-Object`). Comme ce sont des objets, aucune donnée n'est perdue ou tronquée en cours de route.

### 🔍 2.2 Anatomie Technique
- `Where-Object` (alias `?`) : Filtre les objets selon une condition.
- `Select-Object` (alias `select`) : Choisit les propriétés à afficher.
- `Sort-Object` (alias `sort`) : Trie les objets.
- `Export-Csv` : Sauvegarde les objets dans un fichier structuré.

### 🛠️ 2.3 Atelier Pratique Hands-on
```powershell
# Prendre les processus, filtrer ceux consommant plus de 100 Mo de RAM (Working Set),
# Sélectionner juste le Nom et la RAM, puis trier.
Get-Process | 
    Where-Object { $_.WS -gt 100MB } | 
    Select-Object Name, WS, CPU | 
    Sort-Object WS -Descending

# Arrêter tous les processus dont le nom commence par "notepad"
Get-Process -Name notepad* | Stop-Process
```
*(L'astuce : `$_` représente l'objet courant traversant le pipeline)*

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : La commande pipeline renvoie une erreur "Propriété introuvable".
**Réflexe** : Faites toujours un `... | Get-Member` ou un `... | Select-Object * -First 1` pour vérifier comment PowerShell nomme la propriété. La "RAM" s'appelle souvent `WorkingSet` (WS) ou `WorkingSet64`.

---

## 3) Variables, Boucles et Scripts (.ps1) (2h00)

### 📖 3.1 Narration & Intuition
L'intérêt de l'administration n'est pas de taper les mêmes commandes tous les jours. Nous allons regrouper nos commandes dans un fichier texte (un script), y stocker des valeurs temporaires (variables) et dire à l'ordinateur de répéter une action (boucles) jusqu'à ce que le travail soit terminé.

### 🔍 3.2 Anatomie Technique
- **Variables** : Commence toujours par `$`. Pas besoin de déclarer le type (fortement typé mais dynamique).
- **Boucles** : `foreach ($item in $collection)` ou via le pipeline `ForEach-Object` (alias `%`).
- **Conditionnels** : `if ($a -eq $b) { ... } else { ... }`. Attention, l'égalité c'est `-eq` (equal), pas `==`.

### 🛠️ 3.3 Atelier Pratique Hands-on
```powershell
# 1. Variables et conditions
$ServiceCible = "Spooler"
$Etat = (Get-Service -Name $ServiceCible).Status

if ($Etat -ne "Running") {
    Write-Host "Le service $ServiceCible est arrêté. Tentative de démarrage..." -ForegroundColor Red
    Start-Service -Name $ServiceCible
} else {
    Write-Host "Le service $ServiceCible tourne déjà." -ForegroundColor Green
}

# 2. Boucle ForEach
$Serveurs = @("SRV-WEB01", "SRV-BDD01")
foreach ($Srv in $Serveurs) {
    Write-Output "Ping de $Srv..."
    # Test-Connection -ComputerName $Srv -Count 1
}
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : Mon script s'exécute mais ferme la fenêtre immédiatement, je ne vois pas les erreurs.
**Réflexe** : Ne double-cliquez pas sur un fichier `.ps1`. Lancez le terminal PowerShell, naviguez vers le dossier avec `cd`, et tapez `./monscript.ps1`. Vous verrez ainsi toute la sortie.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Export des services stoppés
- **Consigne** : Écrivez une ligne de commande (one-liner) qui liste tous les services actuellement arrêtés, sélectionne leur nom et leur nom d'affichage (DisplayName), et les exporte dans un fichier `C:\services_arretés.csv`.
- **Livrables à produire** : La ligne de commande et une capture des premières lignes du fichier CSV.
- **Corrigé détaillé & Guidé** :
  ```powershell
  Get-Service | Where-Object { $_.Status -eq 'Stopped' } | Select-Object Name, DisplayName | Export-Csv -Path "C:\services_arretés.csv" -NoTypeInformation
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la différence fondamentale entre Bash et PowerShell ?
A) Bash est plus récent
B) Bash manipule du texte, PowerShell manipule des objets .NET
C) PowerShell ne marche que sans interface graphique
D) PowerShell ne gère pas le réseau
*Réponse : B*

2. QCM: À quoi sert `Get-Member` ?
A) Afficher les membres du groupe Administrateurs
B) Découvrir les propriétés et méthodes de l'objet passé dans le pipeline
C) Télécharger des paquets
D) Créer un nouvel utilisateur
*Réponse : B*

3. QCM: Quel opérateur logique signifie "égal à" en PowerShell ?
A) `==`
B) `=`
C) `-eq`
D) `-equal`
*Réponse : C*

4. QCM: Comment débloquer l'exécution des scripts locaux sur un PC Windows ?
A) `chmod +x script.ps1`
B) `Set-ExecutionPolicy RemoteSigned`
C) Il n'y a pas besoin, c'est actif par défaut
D) `Unlock-PowerShell`
*Réponse : B*

5. QCM: Dans un pipeline PowerShell, que représente la variable `$_` ?
A) La fin du fichier
B) Le dernier processus arrêté
C) L'objet courant transmis à travers le pipeline
D) Une variable d'environnement système
*Réponse : C*
