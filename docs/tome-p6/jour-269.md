# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 269 (6h) : Forensique Mémoire Avancée (Volatility 3 Linux/Windows Kernels, Malfind, Code Injection & Rootkit Detection)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**analyse forensique de la mémoire RAM volatile de niveau expert** ciblée par les certifications **GCFA** et **FOR508 (SANS)** : utiliser **Volatility 3** pour extraire des artefacts mémoire complexes sous Linux et Windows, détecter les injections de code DLL (`malfind`), analyser les crochets du noyau (**Kernel Hooks / DKOM**), et identifier la présence de rootkits dissimulés.
>
> **Compétences visées :** `DFIR-01` (A) — Advanced Memory Forensics (Volatility 3) | `DFIR-02` (A) — Malware Memory Injection & Rootkit Analysis

---

## 1) Module — Deep Dive Volatility 3 & Architecture Mémoire (1h30)

### 📖 Narration/Intuition

L'analyse de la mémoire vive (RAM) permet de découvrir ce qui est invisible sur le disque : malwares résidant uniquement en mémoire (Fileless Malware), sessions TLS déchiffrées, clés d'injection Cobalt Strike Beacon, et rootkits noyaux modifiant les structures de données du système (`DKOM - Direct Kernel Object Manipulation`).

---

## 2) Module — Détection des Injections de Code avec Volatility 3 (2h30)

### 🛠️ Atelier Pratique

**Investigation d'un dump mémoire Windows avec Volatility 3 (`volatility3_investigation.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Analyse des processus et de l'arbre d'exécution
# ═══════════════════════════════════════════════════════
# Détecter les processus cachés (inconsistances pslist vs pstree)
python3 vol.py -f memory_dump.raw windows.pslist
python3 vol.py -f memory_dump.raw windows.pstree

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Détection d'injections de code (Process Hollowing / Reflective DLL)
# ═══════════════════════════════════════════════════════
# Le plugin malfind recherche les pages mémoire avec permissions PAGE_EXECUTE_READWRITE (PAGE_EXECUTE_READWRITE)
# ne correspondant à aucune image de binaire sur disque
python3 vol.py -f memory_dump.raw windows.malfind

# Dump de la section injectée suspecte pour analyse
python3 vol.py -f memory_dump.raw windows.savedump --pid 4128

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Extraction des clés de chiffrement et connexions réseau
# ═══════════════════════════════════════════════════════
# Lister les connexions réseau actives lors du dump
python3 vol.py -f memory_dump.raw windows.netscan

# Extraction des hashs NTLM de la mémoire SAM/LSASS
python3 vol.py -f memory_dump.raw windows.hashdump
python3 vol.py -f memory_dump.raw windows.lsass
```

---

## 3) Module — Forensique Mémoire Linux Kernel & Rootkits (2h)

### 🛠️ Analyse d'un Dump RAM Linux avec Volatility 3 (`vol3_linux.sh`)

```bash
# Analyse mémoire d'un serveur Linux (Kernel 5.x/6.x)
# Utilisation du plugin linux.pslist et linux.check_syscall

# 1) Lister les processus Linux
python3 vol.py -f linux_dump.mem linux.pslist

# 2) Détecter les hooks de la table des appels système (Syscall Table Hooking / Rootkits)
python3 vol.py -f linux_dump.mem linux.check_syscall

# 3) Lister les modules noyaux chargés (et repérer les modules masqués)
python3 vol.py -f linux_dump.mem linux.lsmod
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Volatility 3** | Framework de référence open-source d'analyse forensique de la mémoire vive (RAM) |
| **malfind** | Plugin Volatility de détection des injections de code (Process Hollowing, DLL Injection) |
| **DKOM** | Direct Kernel Object Manipulation — Technique de modification directe des structures noyaux par un rootkit |
| **GCFA** | GIAC Certified Forensic Analyst — Certification SANS FOR508 de référence mondiale en DFIR |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Volatility 3, quel plugin est spécifiquement conçu pour identifier les injections de code en mémoire (ex: Reflective DLL Injection, Process Hollowing) en cherchant les pages exécutables non cartographiées sur disque ?
- A) `windows.malfind`
- B) `windows.pslist`
- C) `windows.netscan`
- D) `windows.registry`

**Réponse : A**

**Q2 :** Que signifie la technique d'attaque rootkit appelée **DKOM (Direct Kernel Object Manipulation)** ?
- A) La modification directe des structures de données en mémoire du noyau Linux/Windows (ex: délier un processus de la liste `ActiveProcessLinks` pour le rendre invisible aux outils système)
- B) La suppression de fichiers sur le disque dur
- C) L'envoi de mails de phishing
- D) L'interception de mots de passe réseau

**Réponse : A**

**Q3 :** Quel plugin Volatility 3 permet d'analyser les sockets et connexions réseau actives lors de la capture mémoire d'un système Windows ?
- A) `windows.netscan`
- B) `windows.filescan`
- C) `windows.cmdline`
- D) `windows.dlllist`

**Réponse : A**

**Q4 :** Quelle combinaison de permissions de pages mémoire (Memory Protection Flags) est l'indicateur principal d'une injection de shellcode détectée par `malfind` ?
- A) `PAGE_EXECUTE_READWRITE` (0x40) associée à un en-tête MZ/PE ou du shellcode sans fichier image sous-jacent
- B) `PAGE_READONLY`
- C) `PAGE_NOACCESS`
- D) `PAGE_WRITECOPY`

**Réponse : A**

**Q5 :** Quelle certification SANS / GIAC est la référence internationale pour l'analyse forensique mémoire et la réponse aux incidents complexes (FOR508) ?
- A) GCFA (GIAC Certified Forensic Analyst)
- B) GSEC
- C) CEH
- D) CISSP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
