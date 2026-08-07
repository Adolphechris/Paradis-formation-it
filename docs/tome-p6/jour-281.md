# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 281 (6h) : Reverse Engineering Avancé & Unpacking (Ghidra, x64dbg, Dépaquetage UPX/Custom, Contournement Anti-Debugging & Process Injection)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Reverse Engineering binaire et le dépaquetage (Unpacking) de malwares complexes** ciblés par les certifications **GREM** (GIAC Reverse Engineering Malware) et **OSED** (Offensive Security Exploit Developer) : utiliser **x64dbg** et **Ghidra** pour dépaqueter des paquets UPX ou packers sur-mesure, contourner les techniques anti-debugging (`IsDebuggerPresent`, `NtQueryInformationProcess`), et reconstruire la table d'importation (IAT - Import Address Table).
>
> **Compétences visées :** `RE-01` (A) — Advanced Malware Reverse Engineering | `RE-02` (A) — Unpacking & Anti-Debugging Bypass

---

## 1) Module — Concepts des Packers & Anti-Analysis (2h)

### 📖 Narration/Intuition

Pour échapper aux antivirus et compliquer l'analyse par les chercheurs en sécurité, les développeurs de malwares compressent et chiffrent leurs exécutables à l'aide de **packers** (ex: UPX, Themida, VMProtect). Au lancement, un petit stub de dépaquetage (Unpacking Stub) s'exécute, déchiffre le code d'origine dans la mémoire RAM, puis saute vers l'**OEP (Original Entry Point)**.

```
Exécutable Paqueté sur Disque : [ Stub Unpacker ] [ Payload Chiffré ]
                                      │ (Exécution)
                                      ▼
Mémoire RAM :                   [ Unpacker ] ──(Déchiffre)──► [ Payload en Clair ] ──(Jump OEP)──► EXECUTION
```

---

## 2) Module — Dépaquetage Manuel avec x64dbg (`manual_unpacking.md`) (2h)

### 🛠️ Atelier Pratique — Méthodologie d'Unpacking Manuel pas à pas

```text
1. Charger le binaire paqueté dans x64dbg (x64) ou x32dbg (x86).
2. Placer un Breakpoint sur la fonction d'allocation mémoire VirtualAlloc / VirtualProtect :
   bp VirtualAlloc
   bp VirtualProtect

3. Exécuter jusqu'au Breakpoint (F9). Observer l'adresse mémoire retournée dans RAX/EAX.
4. Suivre l'adresse dans le Dump Mémoire (Follow in Dump).

5. Avancer pas à pas (F8) jusqu'à ce que le Stub déchiffre les octets du PE (En-tête MZ / PE).
6. Repérer l'instruction de saut lointain vers le payload d'origine (JMP / CALL vers une section distante) :
   JMP 0x00401000  <-- C'est le saut vers l'Original Entry Point (OEP) !

7. Poser un Breakpoint sur l'OEP et exécuter.
8. Une fois arrêté sur l'OEP, utiliser le plugin Scylla (intégré dans x64dbg) :
   - CLIQUER SUR "IAT Autosearch"
   - CLIQUER SUR "Get Imports"
   - CLIQUER SUR "Dump" -> Sauvegarder le binaire dépaqueté sur disque (unpacked.exe)
   - CLIQUER SUR "Fix Dump" -> Reconstruire la table d'importation IAT !
```

---

## 3) Module — Script Python de détection d'Anti-Debugging (`anti_debug_bypass.py`) (2h)

```python
# Script Python x64dbg / GDB pour neutraliser automatiquement les checks Anti-Debugging

import pefile

def scan_anti_debug(pe_path: str):
    """Analyser statiquement les APIs Anti-Debugging importées par le PE"""
    pe = pefile.PE(pe_path)
    anti_debug_apis = [b"IsDebuggerPresent", b"CheckRemoteDebuggerPresent", b"NtQueryInformationProcess"]

    found_apis = []
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            for imp in entry.imports:
                if imp.name in anti_debug_apis:
                    found_apis.append(imp.name.decode())

    print(f"[*] Analyse Anti-Debug sur {pe_path} :")
    if found_apis:
        print(f"[!] DÉTECTION : Le binaire utilise les APIs Anti-Debug : {found_apis}")
        print("[+] Action conseillée : Patcher les retours de ces APIs avec le plugin ScyllaHide dans x64dbg.")
    else:
        print("[+] Aucune API Anti-Debug standard détectée dans l'IAT.")

scan_anti_debug("packed_sample.exe")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OEP** | Original Entry Point — Point d'entrée d'origine du binaire avant paquetage |
| **IAT** | Import Address Table — Table des adresses des fonctions DLL importées par un PE |
| **GREM** | GIAC Reverse Engineering Malware — Certification SANS FOR610 de référence en RE Malware |
| **POSED** | Offensive Security Exploit Developer — Certification OffSec spécialisée en RE et Exploit Dev |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le reverse engineering d'un binaire paqueté (packed malware), que représente l'**OEP (Original Entry Point)** ?
- A) Le point d'entrée d'origine du code malveillant en mémoire vers lequel le stub d'unpacker effectue un saut une fois le déchiffrement terminé
- B) La première ligne du fichier de configuration
- C) La clé AES de chiffrement
- D) L'adresse IP du serveur C2

**Réponse : A**

**Q2 :** Quel plugin intégré à l'inspecteur x64dbg est utilisé pour dumper le binaire de la mémoire RAM et reconstruire son **IAT (Import Address Table)** après avoir atteint l'OEP ?
- A) Scylla
- B) Volatility
- C) Wireshark
- D) Ghidra

**Réponse : A**

**Q3 :** Quelle fonction de l'API Windows standard est fréquemment appelée par les malwares pour vérifier s'ils s'exécutent dans l'environnement d'un débogueur ?
- A) `IsDebuggerPresent()`
- B) `CreateFile()`
- C) `malloc()`
- D) `printf()`

**Réponse : A**

**Q4 :** Quel est le rôle principal d'un plugin comme **ScyllaHide** dans un environnement de Reverse Engineering ?
- A) Intercepter et neutraliser automatiquement les tentatives de détection d'anti-debugging en retournant des valeurs simulant un environnement normal
- B) Accélérer le processeur
- C) Supprimer les fichiers temporaires
- D) Convertir le C++ en Python

**Réponse : A**

**Q5 :** Quelle certification SANS / GIAC (FOR610) est la référence internationale pour l'ingénierie inverse et l'analyse de malwares complexes ?
- A) GREM (GIAC Reverse Engineering Malware)
- B) GSEC
- C) CISSP
- D) CEH

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
