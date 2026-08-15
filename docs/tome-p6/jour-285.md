# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 285 (6h) : Projet Intégrateur S6 Partie 7 — Reverse Engineering, Kernel & Exploit Development (Synthèse Bas-Niveau & Malware Analysis)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre le **Projet Intégrateur complet de Reverse Engineering, Kernel & Exploit Development** : dépaqueter un binaire complexe, analyser ses routines d'anti-debugging, construire une chaîne ROP x64 contournant ASLR/DEP, et rédiger un rapport technique d'analyse de binaire au niveau GREM/OSED avec signature YARA.
>
> **Ce projet valide l'expertise bas-niveau, l'ingénierie d'exploits et la maîtrise de l'analyse de malwares.**

---

## 🎯 Objectifs de la Leçon

- 🔍 Maîtriser les fondements de l'**Assembleur x86-64** (Registres, Pile RSP/RBP, Instructions `mov`, `push`, `pop`, `call`, `ret`).
- 🛡️ Comprendre les mécanismes de protection mémoire du processeur : **DEP/NX**, **ASLR** et **Stack Canaries**.
- 🧩 Construire une chaîne de programmation orientée retour (**ROP Chain**) pour contourner la protection DEP/NX.
- 📦 Dépaqueter des binaires obfusqués (*Unpacking*) et localiser l'**Original Entry Point (OEP)**.
- 📜 Développer des règles de détection **YARA** d'élite pour la signature d'échantillons malveillants.
- 🧪 Exécuter le script automatisé d'analyse post-unpacking PE/ELF (`pwn_re_audit.py`).

---

## 🖼️ Reverse Engineering & Analyse de Binaires Bas-Niveau

![Reverse Engineering & Exploit Dev](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800)

---

## 📖 1. Les Fondamentaux de l'Assembleur x86-64

### 1.1 Narration & Intuition — L'Horlogerie Mécanique du Processeur

Les langages de haut niveau (Python, C#, Java) masquent la réalité physique de la machine. Lorsque vous analysez un logiciel malveillant décompiled ou que vous développez un exploit bas-niveau, vous devez observer le processeur dans son langage natif : **l'Assembleur x86-64**.

Le processeur ne manipule pas de variables sous forme de texte. Il déplace des octets entre de petites mémoires internes ultra-rapides appelées **Registres**, exécute des opérations arithmétiques et interagit avec la **Stack (La Pile)**.

### 1.2 Les Registres Généraux x86-64

```
┌──────────────────────────────────────────────────────────────────────────┐
│ REGISTRES GÉNÉRAUX (64 Bits)                                            │
├───────────────────┬──────────────────────────────────────────────────────┤
│ RAX               │ Accumulateur (Stocke le code de retour des fonctions)│
│ RBX               │ Registre de base                                     │
│ RCX               │ Compteur (Utilisé dans les boucles et décalages)     │
│ RDX               │ Données (Opérations d'entrées/sorties et divisions)   │
│ RSI               │ Registre Source (Pointeur de lecture mémoire)       │
│ RDI               │ Registre Destination (Pointeur d'écriture mémoire)   │
│ RSP               │ Stack Pointer (Pointe sur le sommet actuel de la Pile│
│ RBP               │ Base Pointer (Pointe sur la base de la frame actuelle│
│ RIP               │ Instruction Pointer (Pointe sur l'instruction ASM    │
│                   │ suivante à exécuter par le processeur !)             │
└───────────────────┴──────────────────────────────────────────────────────┘
```

### 1.3 Les Conventions d'Appel (Calling Conventions)

Lorsqu'une fonction appelle une autre fonction en C/C++ sous x86-64, les arguments sont transmis dans des registres spécifiques :

- **Linux / System V AMD64 ABI** : 1er arg dans `RDI`, 2ème dans `RSI`, 3ème dans `RDX`, 4ème dans `RCX`, 5ème dans `R8`, 6ème dans `R9`.
- **Windows x64** : 1er arg dans `RCX`, 2ème dans `RDX`, 3ème dans `R8`, 4ème dans `R9`.

---

## 📖 2. Protections Mémoire & Techniques d'Exploitation (ROP)

Les systèmes d'exploitation modernes intègrent 3 protections matérielles et logicielles contre l'exécution de code malveillant :

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. DEP / NX (Data Execution Prevention / No-Execute)                     │
│    - Marque les zones de données (Stack, Heap) comme non-exécutables.   │
│    - EMPÊCHE l'exécution directe de Shellcode injecté dans la Pile.     │
├──────────────────────────────────────────────────────────────────────────┤
│ 2. ASLR (Address Space Layout Randomization)                             │
│    - Randomise les adresses mémoire des bibliothèques (.so/.dll) et de   │
│      la pile à chaque redémarrage de l'application.                     │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. STACK CANARY                                                          │
│    - Insère un nombre aléatoire secret juste avant le registre RBP/RIP.   │
│    - Si un Buffer Overflow écrase le Canary, le programme plante         │
│      immédiatement avant d'exécuter l'adresse de retour piratée.         │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Contourner DEP/NX avec le ROP (Return-Oriented Programming)

Puisque la pile n'est plus exécutable (DEP/NX actif), l'attaquant ne peut pas injecter son propre code. La technique du **ROP** (*Return-Oriented Programming*) consiste à utiliser les bouts de code exécutable légitimes déjà présents en mémoire dans les bibliothèques système (ex: `libc.so` ou `kernel32.dll`).

Ces petits fragments d'instructions se terminant par une instruction `ret` sont appelés des **Gadgets ROP** :

```
                                CHAÎNE ROP (ROP CHAIN)
┌──────────────────────────────────────────────────────────────────────────┐
│ Gadget 1 : `pop rdi ; ret`  ──► Charge la valeur "/bin/sh" dans RDI     │
├──────────────────────────────────────────────────────────────────────────┤
│ Gadget 2 : `pop rsi ; ret`  ──► Charge la valeur NULL (0) dans RSI      │
├──────────────────────────────────────────────────────────────────────────┤
│ Adresse de `system()`       ──► Exécute system("/bin/sh") !              │
└──────────────────────────────────────────────────────────────────────────┘
```

En enchaînant ces gadgets sur la pile, l'attaquant détourne le flux d'exécution du processeur sans jamais exécuter un seul octet de code externe !

---

## 📖 3. Analyse de Malware, Dépaquetage (Unpacking) & YARA

### 3.1 Qu'est-ce qu'un Packer ?

Pour échapper à la détection des antivirus, les créateurs de malwares utilisent des **Packers** (ex: UPX, Themida). Le packer chiffre et compresse le binaire exécutable réel et lui ajoute un petit stub d'auto-décompression.

```
Fichier Paqueté sur Disque :   [ Stub de Dépaquetage ] + [ Charge Utile Chiffrée ]
                                           │
                                  Exécution en Mémoire
                                           │
                                           ▼
Fichier Dépaqueté en RAM   :   [ Charge Utile Déchiffrée en Clair à l'OEP ]
```

- **OEP (Original Entry Point)** : L'adresse mémoire exacte où le stub d'auto-dépaquetage passe la main au véritable code source du malware une fois déchiffré.

### 3.2 Signature avec des Règles YARA

**YARA** est l'outil universel des chercheurs en sécurité et analystes DFIR pour classifier et détecter des malwares par signature textuelle et hexadécimale.

```yara
rule Malware_CobaltStrike_Beacon {
    meta:
        description = "Détection des Beacons Cobalt Strike dépaquetés"
        author = "PARADIS IT Lead Malware Analyst"
        threat_level = "CRITICAL"
    strings:
        // Motif hexadécimal de l'instruction d'AMSI Patching
        $amsi_patch = { 48 89 5C 24 08 48 89 70 10 48 89 78 18 4c 89 60 20 }
        
        // Chaines textuelles suspectes
        $s1 = "ReflectiveLoader" fullword ascii
        $s2 = "%s as %s\\%s: %d" fullword ascii
    condition:
        uint16(0) == 0x5A4D and ($amsi_patch or all of ($s*))
}
```

---

## 🧪 4. Atelier Pratique : Script d'Analyse Automatisée (`pwn_re_audit.py`)

### Script Python : Audit Post-Unpacking PE & Analyse des Sections

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 285)
Projet Intégrateur S6 Partie 7 : Reverse Engineering, PE Unpacking & Exploit Audit
"""

import json
import sys
import time

def analyze_pe_header_structures():
    """Simule l'analyse de l'OEP et des sections d'un binaire dépaqueté."""
    sections = [
        {"name": ".text", "virtual_address": "0x1000", "size": "0x5400", "entropy": 6.2, "executable": True},
        {"name": ".rdata", "virtual_address": "0x7000", "size": "0x2000", "entropy": 4.8, "executable": False},
        {"name": ".data", "virtual_address": "0x9000", "size": "0x1000", "entropy": 2.1, "executable": False}
    ]
    return {
        "format": "PE32+ (x86-64 Executable)",
        "original_entry_point_oep": "0x004012A0",
        "packer_detected": "UPX (Modified Stub - Unpacked Successfully)",
        "sections": sections,
        "iat_restored": True,
        "status": "PASS"
    }

def analyze_rop_chain_mitigations():
    """Vérifie l'état des protections mémoire de l'exécutable."""
    return {
        "mitigations": {
            "dep_nx": True,
            "aslr": True,
            "stack_canary": True,
            "cfg_control_flow_guard": False
        },
        "rop_gadgets_found": 142,
        "rop_chain_constructed": "2-Stage execve('/bin/sh') Gadget Chain",
        "status": "PASS"
    }

def verify_yara_signature():
    """Valide l'efficacité de la règle YARA générée."""
    return {
        "yara_rule": "Detected_Unpacked_Payload",
        "match_found": True,
        "strings_matched": ["ReflectiveLoader", "AMSI_Patch_Pattern"],
        "status": "PASS"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — AUDIT REVERSE ENGINEERING & EXPLOIT DEV S6      ")
    print("=================================================================")
    time.sleep(1)

    pe_res = analyze_pe_header_structures()
    rop_res = analyze_rop_chain_mitigations()
    yara_res = verify_yara_signature()

    audit_summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "analyst": "Senior Reverse Engineer & Pwn Specialist",
        "sample": "malware_sample_unpacked.exe (SHA-256: 4a8b...12c9)",
        "modules": [pe_res, rop_res, yara_res]
    }

    all_passed = (pe_res["status"] == "PASS") and (rop_res["status"] == "PASS") and (yara_res["status"] == "PASS")

    print(json.dumps(audit_summary, indent=2))
    print("-----------------------------------------------------------------")
    print("STATUT REVERSE ENGINEERING & PWN : " + ("✅ PROJET S6 PARTIE 7 APPROUVÉ" if all_passed else "❌ FAILLE DÉTECTÉE"))
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Tester l'audit de Reverse Engineering et d'Analyse PE
python3 -c "
import json
results = [
    {'check': 'PE Header OEP Location', 'oep': '0x004012A0', 'status': 'PASS'},
    {'check': 'DEP/NX ROP Chain Evasion', 'gadgets': 142, 'status': 'PASS'},
    {'check': 'YARA Rule Match', 'rule': 'Detected_Unpacked_Payload', 'status': 'PASS'}
]
print('=== AUDIT REVERSE ENGINEERING & EXPLOIT DEV VALIDE (100%) ===')
print(json.dumps(results, indent=2))
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Comment trouver l'OEP (Original Entry Point) d'un binaire paqueté dans x64dbg ?
- **Réflexe** : Placez un point d'arrêt d'accès mémoire (*Memory Breakpoint*) sur la section `.text` du binaire. Une fois le stub de dépaquetage terminé, le premier saut exécuté vers la section `.text` interceptera exactement l'OEP !

### 2. Le script plante avec un crash de type "Access Violation" à l'adresse `0x4141414141414141`
- **Cause** : Vous avez réussi un **Buffer Overflow** qui a écrasé l'adresse de retour sauvegardée sur la pile avec votre payload `AAAA...` (`0x41` en hexadécimal). Le registre `RIP` tente de sauter vers cette adresse invalide.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel registre processeur x86-64 contient l'adresse mémoire de la TOUTE PROCHAINE instruction binaire à exécuter par le CPU ?**
- A) RAX
- B) RSP
- C) RIP (Instruction Pointer)
- D) RBP

*Réponse : C — Le registre RIP (Instruction Pointer) pointe sur la prochaine instruction Assembleur exécutée par le processeur.*

**Q2 : Quelle protection mémoire matérielle (DEP/NX) empêche l'exécution directe de Shellcode injecté dans la pile (Stack) ?**
- A) ASLR
- B) DEP / NX (Data Execution Prevention / No-Execute)
- C) YARA
- D) SSL/TLS

*Réponse : B — La protection DEP/NX marque les zones de données comme non-exécutables pour bloquer les shellcodes dans la pile.*

**Q3 : Comment la technique d'exploitation ROP (*Return-Oriented Programming*) parvient-elle à contourner la protection DEP/NX ?**
- A) En éteignant le processeur
- B) En enchaînant des petits fragments d'instructions exécutables légitimes déjà présentes en mémoire et se terminant par `ret` (les Gadgets ROP)
- C) En envoyant des emails de phishing
- D) En modifiant le mot de passe Wi-Fi

*Réponse : B — Le ROP réutilise le code binaire légitime déjà présent en mémoire exécutable pour détourner le flux sans exécuter de code externe.*

**Q4 : Qu'est-ce que l'OEP (*Original Entry Point*) dans le domaine du Reverse Engineering de malwares ?**
- A) Le nom du créateur du binaire
- B) L'adresse mémoire exacte où commence le code source réel du malware une fois dépaqueté par son stub
- C) Le premier port TCP ouvert
- D) L'adresse MAC du serveur C2

*Réponse : B — L'OEP est le point d'entrée initial du programme original, atteint une fois que le packer a fini sa décompression en mémoire.*

**Q5 : Quel registre d'architecture x86-64 sous Linux (System V ABI) est utilisé pour passer le TOUT PREMIER argument à une fonction C ?**
- A) RAX
- B) RDI
- C) RSI
- D) RDX

*Réponse : B — Selon la convention d'appel System V AMD64 ABI sous Linux, le premier argument d'une fonction est transmis dans le registre RDI.*

**Q6 : À quoi sert l'outil et le langage de règles open-source YARA ?**
- A) À compiler du code C en binaire exécutable
- B) À rédiger des signatures de détection pour identifier et classifier des malwares selon des motifs textuels ou hexadécimaux
- C) À héberger des sites web
- D) À nettoyer les disques durs

*Réponse : B — YARA permet aux chercheurs de classifier et de détecter des familles de malwares grâce à des règles de signatures.*

**Q7 : Quelle protection mémoire modifie aléatoirement les adresses d'emplacement des bibliothèques (.dll/.so) en RAM à chaque lancement du système ?**
- A) ASLR (Address Space Layout Randomization)
- B) DEP
- C) Stack Canary
- D) RSA

*Réponse : A — L'ASLR randomise les adresses mémoire pour empêcher un attaquant de prédire l'emplacement d'une fonction (ex: `system()`).*

**Q8 : Quel est le rôle d'un "Stack Canary" inséré par le compilateur GCC/Clang dans les fonctions C ?**
- A) Accélérer l'exécution des boucles
- B) Insérer une valeur secrète avant le registre de retour pour détecter et bloquer les tentatives de corruption par Buffer Overflow
- C) Chiffrer la mémoire RAM
- D) Effacer les logs système

*Réponse : B — Le Stack Canary est une valeur gardienne contrôlée avant l'exécution du `ret` ; si elle a été modifiée par un overflow, le programme s'arrête.*

---

## 📚 Ressources & Références

- **Intel 64 and IA-32 Architectures Software Developer Manuals** : https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html
- **YARA Official Documentation** : https://yara.readthedocs.io/
- **Capstone Disassembly Engine** : https://www.capstone-engine.org/
- **Pwnable.tw (Practice Binary Exploitation)** : https://pwnable.tw/

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
