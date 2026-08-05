# SEMESTRE 1 — Jour 10 (6h) : Projet Synthétique Semestre 1 (Partie 1)

> [!NOTE]
> **Objectif de la journée** : Consolider les acquis Linux et Windows en développant un outil d'audit système hybride automatisé, générant un rapport formaté.
> **Compétences visées** : `BIT-01` (A), `BIT-02` (A), `BIT-03` (A), `PRO-01` (A) — Audit et rapport système hybride.

---

## 1) Conception de l'Audit Hybride (1h30)

### 📖 1.1 Narration & Intuition
Vous êtes embauché dans une PME qui possède un parc de serveurs mélangés (Des serveurs Web sous Linux Debian, des serveurs de fichiers sous Windows Server). Le directeur informatique veut un rapport quotidien sur l'état de santé des machines. Plutôt que de vous connecter manuellement sur chaque machine, vous allez créer un script universel pour chaque monde (un script Bash pour Linux, un script PowerShell pour Windows) qui récupère les mêmes informations et les formate proprement.

### 🔍 1.2 Anatomie Technique
Les métriques vitales à remonter :
- **Nom de la machine (Hostname)** : Qui suis-je ?
- **OS & Kernel/Version** : Sur quoi je tourne ?
- **CPU & RAM** : État de charge.
- **Stockage (Disque C: ou `/`)** : Reste-t-il de la place ?
- **Utilisateurs connectés** : Y a-t-il un intrus ?

### 🛠️ 1.3 Atelier Pratique Hands-on
*(Conception architecturale sur tableau blanc / bloc-notes)*
- Format de sortie attendu : Fichier texte simple (ex: `rapport_audit_SRV1.txt`)
- Arborescence prévue :
  - `audit.sh` (Linux)
  - `audit.ps1` (Windows)
  - Dossier partagé ou dossier de log local pour déposer les rapports.

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : Les métriques mesurées changent de nom selon l'OS (ex: Mémoire libre vs Memory Available).
**Réflexe** : Le script doit être conçu pour "traduire" ces données métier dans un langage commun. Le client (Directeur IT) s'en moque que ce soit "MemAvailable" sous Linux et "FreePhysicalMemory" sous Windows, il veut lire "RAM Disponible : X Go".

---

## 2) Développement : Le Script Linux (Bash) (2h00)

### 📖 2.1 Narration & Intuition
Sous Linux, nous allons assembler des briques simples (`uname`, `free`, `df`, `who`) à l'aide de commandes d'extraction et de redirection de flux (`>`) pour composer un beau fichier.

### 🔍 2.2 Anatomie Technique
- `hostname` / `uname -a`
- `free -h` pour la mémoire.
- `df -h /` pour l'espace disque de la partition racine.
- Redirection : `>` pour créer/écraser le fichier, `>>` pour ajouter à la fin du fichier.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
#!/bin/bash
# Fichier : audit.sh
RAPPORT="audit_$(hostname).txt"

echo "=== RAPPORT D'AUDIT LINUX ===" > $RAPPORT
echo "Date : $(date)" >> $RAPPORT
echo "Machine : $(hostname)" >> $RAPPORT
echo "Noyau : $(uname -r)" >> $RAPPORT
echo "------------------------------" >> $RAPPORT

echo "=== UTILISATION RAM ===" >> $RAPPORT
free -h | grep "Mem" | awk '{print "Total: " $2 " / Utilisé: " $3}' >> $RAPPORT

echo "=== ESPACE DISQUE RACINE ===" >> $RAPPORT
df -h / | tail -n 1 | awk '{print "Taille: " $2 " / Libre: " $4}' >> $RAPPORT

echo "Audit terminé, fichier $RAPPORT généré."
```
*N'oubliez pas : `chmod +x audit.sh`*

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : `awk` découpe mal la chaîne car le format de sortie de `df` a changé à cause des longs noms de chemins de disques.
**Réflexe** : Utiliser `df -Ph /` (Portable format) pour forcer l'affichage sur une seule ligne.

---

## 3) Développement : Le Script Windows (PowerShell) (2h30)

### 📖 3.1 Narration & Intuition
Sous Windows, nous allons interroger les objets de l'ordinateur via les requêtes WMI/CIM ou les cmdlets standards, puis nous allons formater la sortie dans un fichier texte. C'est plus verbeux, mais extrêmement précis.

### 🔍 3.2 Anatomie Technique
- `env:computername` ou `hostname`
- `Get-CimInstance Win32_OperatingSystem` (Donne la RAM et l'OS).
- `Get-Volume -DriveLetter C`
- `Out-File` ou redirection `>` pour écrire le rapport.

### 🛠️ 3.3 Atelier Pratique Hands-on
```powershell
# Fichier : audit.ps1
$NomMachine = $env:COMPUTERNAME
$Rapport = "audit_$NomMachine.txt"

$Date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$OSInfo = Get-CimInstance Win32_OperatingSystem

"=== RAPPORT D'AUDIT WINDOWS ===" | Out-File $Rapport
"Date : $Date" | Out-File $Rapport -Append
"Machine : $NomMachine" | Out-File $Rapport -Append
"Version OS : $($OSInfo.Caption)" | Out-File $Rapport -Append
"------------------------------" | Out-File $Rapport -Append

$TotalRAM = [math]::Round($OSInfo.TotalVisibleMemorySize / 1MB, 2)
$FreeRAM = [math]::Round($OSInfo.FreePhysicalMemory / 1MB, 2)
"=== UTILISATION RAM ===" | Out-File $Rapport -Append
"Total: $TotalRAM Go / Libre: $FreeRAM Go" | Out-File $Rapport -Append

$DisqueC = Get-Volume -DriveLetter C
$SizeC = [math]::Round($DisqueC.Size / 1GB, 2)
$FreeC = [math]::Round($DisqueC.SizeRemaining / 1GB, 2)
"=== ESPACE DISQUE C: ===" | Out-File $Rapport -Append
"Taille: $SizeC Go / Libre: $FreeC Go" | Out-File $Rapport -Append

Write-Host "Audit terminé, fichier $Rapport généré." -ForegroundColor Green
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : Les valeurs de RAM (FreePhysicalMemory) remontent en Kilo-octets, ce qui est illisible.
**Réflexe** : En PowerShell, utiliser la classe mathématique statique `[math]::Round($valeur / 1MB, 2)` ou `1GB` pour convertir et arrondir à 2 décimales.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Finalisation du Projet
- **Consigne** : Implémentez les deux scripts (Linux et Windows) sur vos machines ou VMs respectives.
- **Livrables à produire** : Le code source `audit.sh`, le code source `audit.ps1`, et une capture d'écran du fichier texte de rapport généré dans les deux environnements.
- **Corrigé détaillé & Guidé** : Suivez exactement les blocs de l'Atelier Pratique 2.3 et 3.3.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Que fait la commande `>>` sous Bash ?
A) Elle supprime le fichier
B) Elle écrase le fichier avec de nouvelles données
C) Elle ajoute la sortie à la fin du fichier existant
D) Elle met en pause le script
*Réponse : C*

2. QCM: En PowerShell, comment récupérer proprement les informations détaillées du système d'exploitation ?
A) `Get-OS`
B) `Get-CimInstance Win32_OperatingSystem`
C) `cat /etc/os-release`
D) `Show-Windows`
*Réponse : B*

3. QCM: Pourquoi utilise-t-on `awk` conjointement avec `free -h` sous Linux ?
A) Pour installer plus de RAM
B) Pour colorer la sortie
C) Pour filtrer et formater des colonnes spécifiques du texte en sortie
D) Pour arrêter les processus lourds
*Réponse : C*

4. QCM: Quel paramètre faut-il ajouter à `Out-File` en PowerShell pour ne pas écraser le contenu précédent ?
A) `-Force`
B) `-NoClobber`
C) `-Add`
D) `-Append`
*Réponse : D*

5. QCM: Quel est l'équivalent de `chmod +x` sous Windows PowerShell ?
A) `Set-ExecutionPolicy`
B) `Attrib +x`
C) Les scripts `.ps1` sont toujours exécutables par défaut
D) `Takeown`
*Réponse : A*
