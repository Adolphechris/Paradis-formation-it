# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 285 (6h) : Projet Intégrateur S6 Partie 7 — Reverse Engineering, Kernel & Exploit Development (Synthèse Bas-Niveau & Malware Analysis)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre le **Projet Intégrateur complet de Reverse Engineering, Kernel & Exploit Development** : dépaqueter un malware complexe, analyser ses routines d'anti-debugging, construire un exploit ROP x64 contournant ASLR/DEP, et rédiger un rapport technique d'analyse de binaire au niveau GREM/OSED.
>
> **Ce projet valide l'expertise bas-niveau et la maîtrise du reverse engineering binaire de l'apprenant.**

---

## 1) Module — Synthèse du Projet Intégrateur Bas-Niveau (2h)

### 📖 Présentation du Scénario d'Analyse

Un binaire hautement obfusqué et paqueté (`malware_sample.exe`) a été intercepté lors d'une intrusion. L'objectif est d'effectuer l'analyse statique et dynamique, de dépaqueter le binaire, d'extraire la chaîne ROP utilisée et de documenter la méthode d'évasion.

---

## 2) Module — Script d'Analyse et Dépaquetage Automatisé (`pwn_re_audit.py`) (2h30)

```python
import pefile

# Script d'analyse automatisée de PE dépaqueté (Post-Unpacking Analysis)

def analyze_unpacked_pe(pe_path: str):
    pe = pefile.PE(pe_path)

    print(f"=== ANALYSE POST-UNPACKING DE {pe_path} ===")
    print(f"[*] Adresse du EntryPoint (OEP) : {hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint)}")
    print(f"[*] Nombre de sections PE : {len(pe.sections)}")

    for section in pe.sections:
        name = section.Name.decode('utf-8').strip('\x00')
        print(f"  Section: {name} | VirtSize: {hex(section.Misc_VirtualSize)} | Perms: {hex(section.Characteristics)}")

    print("\n[*] Analyse des DLLs importées (IAT) :")
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            print(f"  - DLL: {entry.dll.decode('utf-8')}")

analyze_unpacked_pe("unpacked_sample.exe")
```

---

## 3) Module — Rapport Technique d'Analyse de Malware GREM (1h30)

```markdown
# RAPPORT D'ANALYSE TECHNIQUE BAS-NIVEAU — GREM / OSED STYLE
**Date :** 2026-08-07
**Échantillon :** `malware_sample.exe` (SHA-256: 4a8b...12c9)

## 1. Caractéristiques d'Unpacking
- **Packer identifié :** UPX modifié avec en-tête altéré
- **Original Entry Point (OEP) :** `0x004012A0` (Trouvé via breakpoint VirtualProtect)
- **IAT Restoration :** Reconstruite avec succès via Scylla Plugin

## 2. Analyse de l'Exploit ROP
- **Protections cibles :** ASLR + DEP actifs
- **Technique d'évasion :** 2-Stage ROP Chain avec fuite d'adresse GOT `puts` suivie de l'appel `system("/bin/sh")`

## 3. Recommandations de Détection (YARA Rule)
```yara
rule Detected_Unpacked_Payload {
    meta:
        author = "PARADIS IT RE Team"
    strings:
        $a = "cmd.exe /c powershell -W Hidden"
        $b = { 48 89 5C 24 08 48 89 70 10 }
    condition:
        all of them
}
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **YARA** | Outil et langage d'écriture de règles de détection de motifs binaires/malwares |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
