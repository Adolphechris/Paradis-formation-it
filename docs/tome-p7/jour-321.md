# TOME P7 — Certifications d'Élite & Spécialisations — Jour 321 (6h) : GREM Prep — Malware Analysis Lab (IDA Pro, Pestudio, Strings & Imports Analysis, Behavioral Sandbox & Anti-Analysis Techniques)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**analyse statique et dynamique de malwares** ciblée par la certification **GREM (GIAC Reverse Engineering Malware)** : analyser un binaire suspect avec **Pestudio** (imports, strings, entropy), identifier les techniques d'**anti-analyse** (IsDebuggerPresent, RDTSC timing, sleep obfuscation), ouvrir un malware dans **IDA Pro** et interpréter le graphe de flux de contrôle (CFG), et instrumenter une sandbox **FlareVM** complète.
>
> **Compétences visées :** `GREM-01` (A) — Static Malware Analysis (Pestudio, Strings, PEiD) | `GREM-02` (A) — Dynamic Analysis Sandbox & Anti-Analysis Detection

---

## 1) Module — Analyse Statique : Pestudio, Strings & Imports (2h)

### 📖 Narration/Intuition

L'**analyse statique** examine le binaire malveillant SANS l'exécuter. Les 4 éléments à examiner en premier lors d'un triage rapide :
1. **Entropy** : Valeur > 7.0 → Probablement packé/chiffré
2. **Imports DLL** : `VirtualAlloc`, `WriteProcessMemory`, `CreateRemoteThread` → Injection de processus
3. **Strings** : URLs de C2, domaines, clés de registre, commandes PowerShell encodées
4. **Headers PE** : Architecture (x86/x64), timestamp de compilation, sections `.text`/`.data`/`.rsrc`

---

## 2) Module — Analyse avec Pestudio & Script d'Extraction Automatique (`malware_static_analysis.py`) (2h)

### 🛠️ Atelier Pratique

```python
import pefile
import math
import string

def analyze_pe_sample(filepath: str):
    """Analyse statique rapide d'un binaire PE Windows (exe/dll)."""
    print(f"=== ANALYSE STATIQUE PE — {filepath} ===\n")

    pe = pefile.PE(filepath)

    # ─────────────────────────────────────────────────────────────────────
    # 1) Métadonnées PE
    # ─────────────────────────────────────────────────────────────────────
    arch = "x64" if pe.FILE_HEADER.Machine == 0x8664 else "x86"
    print(f"[*] Architecture : {arch}")
    print(f"[*] Timestamp compilateur : {pe.FILE_HEADER.TimeDateStamp}")
    print(f"[*] Nombre de sections : {pe.FILE_HEADER.NumberOfSections}")

    # ─────────────────────────────────────────────────────────────────────
    # 2) Calcul d'entropie par section (> 7.0 = suspect)
    # ─────────────────────────────────────────────────────────────────────
    print("\n[*] Entropie par section :")
    for section in pe.sections:
        data = section.get_data()
        entropy = calculate_entropy(data)
        flag = "⚠️  HAUTE ENTROPIE (Packed/Chiffré ?)" if entropy > 7.0 else ""
        print(f"  {section.Name.decode().strip(chr(0)):10} Entropie: {entropy:.2f} {flag}")

    # ─────────────────────────────────────────────────────────────────────
    # 3) Imports suspects (injection, persistence, réseau)
    # ─────────────────────────────────────────────────────────────────────
    SUSPICIOUS_IMPORTS = {
        "VirtualAlloc", "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread",
        "NtUnmapViewOfSection", "SetWindowsHookEx", "RegSetValueEx", "CryptEncrypt",
        "InternetOpenUrl", "URLDownloadToFile", "WinExec", "ShellExecuteA"
    }

    print("\n[!] Imports SUSPECTS détectés :")
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            dll = entry.dll.decode()
            for imp in entry.imports:
                if imp.name and imp.name.decode() in SUSPICIOUS_IMPORTS:
                    print(f"  [{dll}] {imp.name.decode()}")

    # ─────────────────────────────────────────────────────────────────────
    # 4) Extraction des strings imprimables (URLs, chemins, clés de registre)
    # ─────────────────────────────────────────────────────────────────────
    print("\n[*] Strings suspects extraites :")
    with open(filepath, 'rb') as f:
        raw = f.read()

    # Extraction des strings ASCII >= 6 caractères
    current = []
    for byte in raw:
        c = chr(byte)
        if c in string.printable and c not in '\t\r\n':
            current.append(c)
        else:
            if len(current) >= 6:
                s = ''.join(current)
                if any(kw in s.lower() for kw in ['http', 'cmd', 'powershell', 'run', 'reg', '.exe', '.dll']):
                    print(f"  → {s}")
            current = []

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    freq = {}
    for byte in data:
        freq[byte] = freq.get(byte, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / len(data)
        entropy -= p * math.log2(p)
    return entropy

# analyze_pe_sample("suspicious_sample.exe")
```

---

## 3) Module — Techniques Anti-Analyse & IDA Pro (2h)

```python
# Techniques Anti-Analyse courantes dans les malwares — GREM Prep

anti_analysis_techniques = [
    {
        "technique": "IsDebuggerPresent",
        "category": "Anti-Debugging",
        "description": "Appel API Windows détectant si le process est en cours de débogage",
        "bypass": "Patcher le flag PEB.BeingDebugged en mémoire (ScyllaHide plugin OllyDbg/x64dbg)"
    },
    {
        "technique": "RDTSC Timing",
        "category": "Anti-Debugging",
        "description": "Mesurer le temps entre deux RDTSC — un debugger ralentit l'exécution",
        "bypass": "NOP les instructions RDTSC ou utiliser ScyllaHide pour contourner"
    },
    {
        "technique": "CheckRemoteDebuggerPresent",
        "category": "Anti-Debugging",
        "description": "API Windows vérifiant si un processus externe debugge l'application",
        "bypass": "Modifier la valeur retournée via hook API ou breakpoint conditionnel"
    },
    {
        "technique": "Sleep(30000) — Long Sleep",
        "category": "Anti-Sandbox",
        "description": "Attendre > timeout sandbox pour éviter l'analyse automatisée",
        "bypass": "Patcher l'instruction Sleep en NOP, ou utiliser une sandbox avec accélération temporelle"
    },
    {
        "technique": "GetSystemInfo — CPU Count",
        "category": "Anti-VM",
        "description": "Vérifier le nombre de CPUs (VM souvent mono-CPU) ou la RAM (< 2GB = sandbox)",
        "bypass": "Configurer la VM avec 4+ vCPUs et 4+ GB de RAM"
    },
    {
        "technique": "String Obfuscation — XOR",
        "category": "Anti-Static-Analysis",
        "description": "Toutes les strings (URLs C2, clés de registre) sont chiffrées en XOR dynamiquement",
        "bypass": "Breakpoint sur l'instruction de déobfuscation, dump mémoire des strings déchiffrées"
    }
]

for t in anti_analysis_techniques:
    print(f"[{t['category']}] {t['technique']}")
    print(f"  Desc   : {t['description']}")
    print(f"  Bypass : {t['bypass']}\n")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GREM** | GIAC Reverse Engineering Malware — Certification SANS d'analyse de malwares |
| **PE** | Portable Executable — Format de fichier binaire Windows (exe, dll, sys) |
| **CFG** | Control Flow Graph — Graphe de flux de contrôle du code assembleur dans IDA Pro |
| **PEB** | Process Environment Block — Structure Windows stockant les métadonnées du processus |
| **FlareVM** | Environnement de reverse engineering Windows de Mandiant/FireEye |
| **Entropy** | Mesure du degré d'aléatoire des données (> 7.0 indique chiffrement ou packing) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'indique une valeur d'**entropie supérieure à 7.0** dans une section PE d'un binaire ?
- A) Le contenu de la section est probablement compressé ou chiffré (indicateur fort de packing ou d'obfuscation — nécessite un décompactage avant analyse statique)
- B) Le fichier est très petit
- C) Le binaire est compilé en Go
- D) La section contient uniquement des ressources images

**Réponse : A**

**Q2 :** Quel import Windows est un indicateur fort d'**injection de code** dans un processus distant ?
- A) `VirtualAllocEx` + `WriteProcessMemory` + `CreateRemoteThread` (la triade classique de l'injection de processus)
- B) `MessageBoxA`
- C) `GetSystemTime`
- D) `RegOpenKeyEx`

**Réponse : A**

**Q3 :** Comment un malware détecte-t-il qu'il s'exécute dans un **environnement sandbox** via les ressources système ?
- A) En vérifiant le nombre de processeurs (`GetSystemInfo`), la quantité de RAM (< 2GB), les artefacts VMware/VirtualBox (clés de registre, drivers), et l'absence d'activité utilisateur réelle
- B) En effectuant un appel DNS vers un serveur de contrôle
- C) En lisant le fichier `C:\Windows\System32\drivers\etc\hosts`
- D) En vérifiant l'adresse IP externe

**Réponse : A**

**Q4 :** Dans IDA Pro, que représente le **Control Flow Graph (CFG)** affiché dans la vue graphique ?
- A) La représentation visuelle de tous les blocs de code assembleur (basic blocks) reliés par des arcs représentant les branchements conditionnels (JZ, JNZ, JMP) — permettant de comprendre la logique du malware
- B) La liste des imports de la DLL
- C) La table des sections PE
- D) Les strings ASCII du binaire

**Réponse : A**

**Q5 :** Pourquoi l'environnement **FlareVM** est-il préféré à une VM Linux pour l'analyse de malwares Windows ?
- A) FlareVM est un environnement Windows spécialement configuré avec tous les outils d'analyse (IDA, x64dbg, Wireshark, pestudio, FLOSS, Ghidra) pré-installés pour analyser des malwares PE nativement dans leur environnement cible
- B) FlareVM est plus rapide que Kali Linux
- C) FlareVM est gratuit et open-source uniquement
- D) FlareVM ne peut analyser que les malwares Linux

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
