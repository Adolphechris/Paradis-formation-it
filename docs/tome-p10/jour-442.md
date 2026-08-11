# TOME P10 — DFIR & Reverse Engineering — Jour 442 (6h) : Forensique Mémoire Avancée (Volatility 3, Process Injection Detection & Memory Artifact Analysis)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser **Volatility 3** pour l'analyse forensique de dumps mémoire Linux et Windows
> - Détecter les techniques d'**injection de code en mémoire** (Process Hollowing, DLL Injection, Reflective Loading)
> - Extraire et reconstruire des **artefacts réseau, processus et registre** depuis une image RAM
> - Identifier les **indicateurs de compromission (IOC) en mémoire** : rootkits DKOM, hooks SSDT
>
> **Compétences visées :** `SEC-05` (A) — Memory Forensics, `SEC-04` (A) — Malware Analysis

---

## Module 1 — Volatility 3 : Architecture & Plugins Fondamentaux (2h)

### 📖 Intuition & Narration

Imaginez que vous soyez détective et qu'on vous remette une photographie instantanée prise à l'intérieur d'un ordinateur compromis : chaque processus en cours, chaque connexion réseau, chaque clé de registre ouverte, chaque fichier verrouillé par un malware — tout est figé dans cet instantané de 16 Go de RAM. Ce n'est pas une métaphore : c'est exactement ce qu'est un **memory dump**, et **Volatility** est la loupe qui révèle ce que personne d'autre ne voit.

### 🔍 Anatomie Technique — Volatility 3 vs Volatility 2

```
VOLATILITY 2 vs VOLATILITY 3

  ┌─────────────────────────────────────────────┐
  │  Volatility 2        │  Volatility 3          │
  ├──────────────────────┼─────────────────────────┤
  │  Python 2.7          │  Python 3.x             │
  │  Profils manuels     │  Symbolique auto (ISF)  │
  │  vol.py --profile=   │  vol.py -f dump.raw     │
  │  Plugins monolithes  │  Architecture modulaire │
  │  Fin de vie (2022)   │  Actif (DFIR standard)  │
  └─────────────────────────────────────────────┘

NOUVEAUTÉS VOLATILITY 3 :
  - Symbol Tables ISF (Intermediate Symbol Format) — téléchargées automatiquement
  - Support natif Linux, macOS, Windows sans profil
  - Plugins réorganisés : windows.*, linux.*, mac.*
  - Parallélisme et performances améliorés
```

### 🛠️ Atelier Pratique — Installation & Premier Triage Volatility 3

```bash
# ========================================================
# INSTALLATION VOLATILITY 3
# ========================================================
git clone https://github.com/volatilityfoundation/volatility3.git
cd volatility3
pip3 install -r requirements.txt

# Test avec un dump mémoire Windows
DUMP="windows_victim.mem"

# ── IDENTIFICATION DU SYSTÈME ────────────────────────────
vol -f $DUMP windows.info

# ── LISTE DES PROCESSUS ─────────────────────────────────
vol -f $DUMP windows.pstree    # Arbre parent-enfant
vol -f $DUMP windows.pslist    # Liste complète
vol -f $DUMP windows.psscan    # Scan direct RAM (détecte les hidden process)

# ── CONNEXIONS RÉSEAU ───────────────────────────────────
vol -f $DUMP windows.netstat   # Connexions actives au moment du dump

# ── HANDLES & FICHIERS OUVERTS ──────────────────────────
vol -f $DUMP windows.handles --pid 1234

# ── DLLs CHARGÉES PAR UN PROCESSUS ─────────────────────
vol -f $DUMP windows.dlllist --pid 1234

# ── COMMANDES EXÉCUTÉES (cmdline) ───────────────────────
vol -f $DUMP windows.cmdline

# ── VARIABLES D'ENVIRONNEMENT ───────────────────────────
vol -f $DUMP windows.envars --pid 1234
```

---

## Module 2 — Détection d'Injection de Code & Rootkits Mémoire (2h)

### 📖 Intuition & Narration

L'attaquant moderne ne dépose plus de fichiers sur le disque — il **vit dans la mémoire**. Cette technique, appelée **fileless malware** ou **in-memory attack**, rend les antivirus basés sur les signatures de fichiers totalement aveugles. Seule l'analyse mémoire peut révéler ces intrusions.

### 🔍 Anatomie Technique — Techniques d'Injection

```
TECHNIQUES D'INJECTION DE CODE EN MÉMOIRE

  1. DLL INJECTION CLASSIQUE
     ├── CreateRemoteThread() + LoadLibraryA()
     ├── Signature : DLL dans PROCESSUS EXTERNE non légitime
     └── Détection : windows.dlllist → DLL sans chemin sur disque

  2. PROCESS HOLLOWING (RunPE)
     ├── Créer processus légitime suspendu (svchost.exe)
     ├── Vider la mémoire et y injecter malware
     └── Détection : windows.malfind → sections PAGE_EXECUTE_READWRITE

  3. REFLECTIVE DLL INJECTION
     ├── DLL qui se charge elle-même en mémoire sans LoadLibrary
     ├── Jamais présente sur le disque
     └── Détection : MZ header (4D 5A) en mémoire sans DLL référencée

  4. THREAD HIJACKING (Process Doppelgänging)
     ├── Hijack d'un thread légitime pour exécuter shellcode
     └── Détection : Threads avec start_addr dans zone non-mappée

  5. DKOM — Direct Kernel Object Manipulation (Rootkit)
     ├── Modification des structures EPROCESS pour cacher un PID
     ├── pslist (liste API) ≠ psscan (scan direct mémoire)
     └── Détection : Comparer pslist vs psscan — PIDs manquants = rootkit
```

### 🛠️ Atelier Pratique — Détection avec Volatility 3

```bash
DUMP="compromised_windows.mem"

# ══════════════════════════════════════════════════════
# 1. DÉTECTION DE CODE INJECTÉ — windows.malfind
# ══════════════════════════════════════════════════════
# Détecte les sections mémoire avec permissions PAGE_EXECUTE_READWRITE
# contenant des headers PE (MZ) ou du shellcode
vol -f $DUMP windows.malfind

# OUTPUT SUSPECT :
# PID 1844 | WINWORD.EXE | VPN 0x1f0000 | MZ header in RWX region
# → Microsoft Word avec shellcode injecté = document malveillant (spear-phishing)

# ══════════════════════════════════════════════════════
# 2. DÉTECTION ROOTKIT DKOM — Comparer pslist vs psscan
# ══════════════════════════════════════════════════════
vol -f $DUMP windows.pslist | awk '{print $2}' | sort > /tmp/pslist_pids.txt
vol -f $DUMP windows.psscan | awk '{print $2}' | sort > /tmp/psscan_pids.txt
diff /tmp/pslist_pids.txt /tmp/psscan_pids.txt
# PIDs dans psscan mais PAS dans pslist = PROCESSUS CACHÉ (rootkit DKOM)

# ══════════════════════════════════════════════════════
# 3. ANALYSE DES HOOKS SSDT (System Service Descriptor Table)
# ══════════════════════════════════════════════════════
# Un rootkit kernel-mode hookte les syscalls SSDT pour intercepter les appels
vol -f $DUMP windows.ssdt
# Chercher des adresses SSDT pointant hors de ntoskrnl.exe/win32k.sys

# ══════════════════════════════════════════════════════
# 4. EXTRACTION D'UN PROCESSUS SUSPECT POUR ANALYSE STATIQUE
# ══════════════════════════════════════════════════════
vol -f $DUMP windows.dumpfiles --pid 1844 --output-dir /tmp/extracted_pid1844/
# Puis analyser avec YARA ou VirusTotal
sha256sum /tmp/extracted_pid1844/*.exe

# ══════════════════════════════════════════════════════
# 5. RECONSTRUCTION DES HIVES REGISTRY CHARGÉS EN MÉMOIRE
# ══════════════════════════════════════════════════════
vol -f $DUMP windows.registry.hivelist
vol -f $DUMP windows.registry.printkey \
    --key "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"
```

---

## Module 3 — Forensique Mémoire Linux & Cas Pratique End-to-End (1h30)

### 🔍 Anatomie Technique — Acquisition Mémoire Linux

```bash
# ══════════════════════════════════════════════════════
# ACQUISITION MÉMOIRE LINUX AVEC LiME (Linux Memory Extractor)
# LiME est un module kernel — méthode légale et non-invasive
# ══════════════════════════════════════════════════════

# Sur le système compromis (si accès SSH root disponible)
# 1. Compiler LiME pour le kernel exact de la cible
apt install linux-headers-$(uname -r) build-essential
git clone https://github.com/504ensicsLabs/LiME.git
cd LiME/src && make

# 2. Acquisition via réseau (pour éviter de toucher le disque local)
# Sur la machine d'acquisition (réception) :
nc -lvp 4444 > victim_ram.lime

# Sur la machine cible (envoi) :
insmod lime-$(uname -r).ko "path=tcp:4444 format=lime"
# → Dump mémoire envoyé via TCP sans écrire sur le disque local

# ══════════════════════════════════════════════════════
# ANALYSE LINUX AVEC VOLATILITY 3
# ══════════════════════════════════════════════════════
DUMP="victim_ram.lime"

vol -f $DUMP linux.bash          # Historique bash en mémoire
vol -f $DUMP linux.pslist        # Processus Linux
vol -f $DUMP linux.psscan        # Scan direct (détecte cachés)
vol -f $DUMP linux.netstat       # Connexions réseau
vol -f $DUMP linux.malfind       # Code injecté (ELF header hors mappings légitimes)
vol -f $DUMP linux.check_syscall # Vérifier les hooks syscall (rootkits Linux)
vol -f $DUMP linux.lsmod         # Modules kernel chargés
```

### 🚑 Terrain — Retour d'Expérience

**Cas réel : Cobalt Strike Beacon in-memory (Banque — 2024)**

Un analyste DFIR détecte qu'un processus `svchost.exe` (PID 3388) effectue des connexions HTTPS toutes les 60 secondes vers une IP en Roumanie. L'analyse Volatility révèle :
- `windows.malfind` : section `0x1c0000` de 512Ko avec permissions RWX et header MZ — c'est un **Reflective Cobalt Strike Beacon**
- `windows.cmdline` : le processus a été lancé avec `C:\Windows\SysWOW64\svchost.exe -k netsvcs` — path correct mais **parent PID = cmd.exe** (anormal : devrait être services.exe)
- `windows.netstat` : connexion HTTPS ESTABLISHED vers `185.220.101.47:443` (TOR exit node)

**Timeline reconstituée :** Phishing email → macro Office → PowerShell cradle → Beacon injecté dans svchost via Process Injection → C2 Cobalt Strike → Mouvement latéral via PsExec.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DKOM** | Direct Kernel Object Manipulation — Technique rootkit modifiant les structures noyau pour cacher des processus |
| **SSDT** | System Service Descriptor Table — Table Windows des pointeurs vers les fonctions syscall noyau |
| **ISF** | Intermediate Symbol Format — Format de symboles de debug utilisé par Volatility 3 |
| **RWX** | Read-Write-Execute — Permissions mémoire dangereuses (une section légale est rarement RWX) |
| **IOC** | Indicator of Compromise — Artefact technique prouvant qu'un système a été compromis |

---

## Exercices Pratiques

### Exercice 1 — Analyse Volatility : Process Hollowing

Vous analysez un dump mémoire et obtenez :
```
PID   Name        PPID  Path
3112  svchost.exe  648  C:\Windows\System32\svchost.exe
3244  svchost.exe 3112  C:\Windows\System32\svchost.exe
```
`windows.malfind` sur PID 3244 retourne une section RWX avec header MZ à 0x400000.

**Question :** Quel indicateur prouve le Process Hollowing ? Quelle est la prochaine commande Volatility à exécuter ?

**Corrigé guidé :**
- **Indicateur :** Un `svchost.exe` avec PPID = autre `svchost.exe` (anormal — devrait être `services.exe` PID 648) + section RWX avec MZ header = Process Hollowing confirmé.
- **Commande suivante :** `vol -f dump.mem windows.dumpfiles --pid 3244` pour extraire le PE injecté, puis `sha256sum` + soumission VirusTotal.

### Exercice 2 — Rootkit DKOM : Comparaison pslist vs psscan

```
pslist  : PIDs 4, 84, 300, 456, 892, 1024
psscan  : PIDs 4, 84, 300, 456, 722, 892, 1024
```
**Question :** Quel PID est caché ? Quelle commande utilisez-vous pour l'analyser malgré le rootkit ?

**Corrigé guidé :**
- **PID caché :** 722 (présent dans psscan mais pas dans pslist = caché par rootkit DKOM)
- **Commande :** `vol -f dump.mem windows.dumpfiles --pid 722` — psscan contourne la liste API manipulée par le rootkit et accède directement aux structures EPROCESS en mémoire.

---

## Banque QCM — 5 Questions

**Q1.** La principale différence entre `windows.pslist` et `windows.psscan` dans Volatility est :

- A) pslist est plus rapide mais moins précis
- B) psscan scanne directement la RAM et détecte les processus cachés par DKOM ✅
- C) pslist analyse les fichiers disque, psscan la mémoire
- D) psscan nécessite des droits administrateur supplémentaires

**Q2.** Le plugin `windows.malfind` recherche principalement :

- A) Les fichiers malveillants sur le disque dur
- B) Les sections mémoire avec permissions RWX contenant des headers PE ✅
- C) Les connexions réseau vers des IPs malveillantes
- D) Les clés de registre modifiées par un malware

**Q3.** Le module LiME (Linux Memory Extractor) est préférable à `/dev/mem` pour l'acquisition car :

- A) Il est plus rapide
- B) Il capture uniquement la mémoire kernel, pas la mémoire utilisateur
- C) Il est un module kernel officiel offrant une capture complète et légalement acceptable ✅
- D) Il ne nécessite pas de droits root

**Q4.** Un processus `cmd.exe` est le parent (PPID) de `svchost.exe`. Cela indique :

- A) Un comportement normal — cmd.exe peut lancer svchost.exe
- B) Une anomalie suspecte — svchost.exe devrait être lancé par services.exe ✅
- C) Une mise à jour Windows en cours
- D) Un processus de diagnostic système légitime

**Q5.** Le **Process Hollowing** se distingue du **DLL Injection** car :

- A) Il nécessite des droits administrateur, pas le DLL Injection
- B) Il crée un processus légitime suspendu et remplace son code par du malware ✅
- C) Il n'est détectable qu'avec des outils kernel
- D) Il ne laisse aucune trace en mémoire

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
