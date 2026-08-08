# TOME P7 — Certifications d'Élite & Spécialisations — Jour 338 (6h) : Digital Forensics Advanced — DFIR Autopsy, Timeline Analysis, Registry Forensics & LNK/Shellbags Artifact Recovery

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques avancées d'**analyse forensique sous Windows (DFIR - Digital Forensics and Incident Response)** : réaliser l'analyse de preuves numériques avec **Autopsy**, construire une **Timeline super-horodatée (Super-Timeline via Plaso / log2timeline)**, analyser les ruches du **Registre Windows (NTUSER.DAT, SYSTEM, SOFTWARE)**, et reconstituer les accès et exécutions d'un attaquant via les artefacts **LNK Files**, **Shellbags**, **Prefetch** et **Shimcache / Amcache**.
>
> **Compétences visées :** `DFIR-01` (A) — Windows Registry & Artifact Forensics (LNK, Prefetch, Shellbags) | `DFIR-02` (A) — Super-Timeline Analysis & Autopsy Investigation

---

## 1) Module — Les Artefacts Critiques d'Exécution Windows (2h)

### 📖 Narration/Intuition

Lorsqu'un attaquant s'introduit sur un système Windows, son activité laisse des empreintes indélébiles dans plusieurs structures système, même s'il supprime ses fichiers :

```
     [ ACTIVITÉ ATTAQUANT ]
               │
               ├── Exécution d'un exécutable ──────► Prefetch (.pf) & Amcache.hve
               ├── Ouverture d'un dossier / fichier ─► LNK Files & Shellbags
               ├── Modification du système ────────► Registry (NTUSER.DAT / SYSTEM)
               └── Persistance ───────────────────► Service / Run keys
```

| Artefact | Emplacement Système | Preuve Fournie |
|:---|:---|:---|
| **Prefetch** | `C:\Windows\Prefetch\*.pf` | Nom de l'exécutable, nombre d'exécutions, horodatage de la dernière exécution |
| **Amcache / Shimcache** | `C:\Windows\appcompat\Programs\Amcache.hve` | Chemin complet du binaire, SHA1, date de première exécution |
| **LNK Files** | `%APPDATA%\Microsoft\Windows\Recent\*.lnk` | Chemin du fichier cible, dates MACB de la cible, numéro de série du volume |
| **Shellbags** | `NTUSER.DAT` & `USRCLASS.DAT` | Preuve d'accès et d'affichage d'un dossier spécifique dans l'Explorateur |

---

## 2) Module — Parser Automatisé d'Artefacts Forensiques (`dfir_artifact_parser.py`) (2h)

### 🛠️ Atelier Pratique

```python
import struct
from datetime import datetime, timezone

class DFIRArtifactParser:
    """
    Parser d'artefacts forensiques Windows (Prefetch & LNK Files) pour investigation DFIR.
    """

    @staticmethod
    def parse_prefetch_header(prefetch_bytes: bytes) -> dict:
        """Parse l'en-tête d'un fichier Prefetch Windows (.pf)."""
        if len(prefetch_bytes) < 84:
            return {"error": "Fichier Prefetch trop court ou corrompu."}

        # Signature MAM / SCCA
        signature = prefetch_bytes[4:8].decode('ascii', errors='ignore')
        file_size = struct.unpack('<I', prefetch_bytes[12:16])[0]
        executable_name = prefetch_bytes[16:76].decode('utf-16le', errors='ignore').strip('\x00')
        hash_val = struct.unpack('<I', prefetch_bytes[76:80])[0]

        return {
            "artifact_type": "PREFETCH",
            "signature": signature,
            "executable_name": executable_name,
            "file_size": file_size,
            "hash": f"{hash_val:08X}"
        }

    @staticmethod
    def parse_lnk_header(lnk_bytes: bytes) -> dict:
        """Parse le Header d'un raccourci Windows (.lnk)."""
        if len(lnk_bytes) < 76 or lnk_bytes[:4] != b'\x4c\x00\x00\x00':
            return {"error": "Signature LNK (0x4C) invalide."}

        # Guid de la classe LNK
        guid = lnk_bytes[4:20].hex()
        flags = struct.unpack('<I', lnk_bytes[20:24])[0]
        
        return {
            "artifact_type": "LNK_SHORTCUT",
            "valid_header": True,
            "header_guid": guid,
            "data_flags": f"0x{flags:08X}"
        }

# Simulation de parsing
mock_lnk_header = b'\x4c\x00\x00\x00\x01\x14\x02\x00\x00\x00\x00\x00\xc0\x00\x00\x00\x00\x00\x00\x46\x81\x00\x00\x00'
print("=== DFIR FORENSIC ARTIFACT PARSER ===")
print("LNK Parsing Result :", DFIRArtifactParser.parse_lnk_header(mock_lnk_header))
```

---

## 3) Module — Super-Timeline & Registre Windows (2h)

```markdown
# CONSTRUCTION D'UNE SUPER-TIMELINE (DFIR)

## 1. Outils de Génération de Timeline (Plaso / log2timeline)
La Super-Timeline agrège toutes les sources d'horodatage d'une image disque dans un ordre chronologique unique :
```bash
# Génération de la timeline au format Plaso
log2timeline.py --storage-file case001.plaso /mnt/evidence_disk.img

# Export au format CSV filtré par plage de dates
psort.py -o l2tcsv -w timeline_report.csv case001.plaso "date >= '2026-08-01 00:00:00' and date <= '2026-08-08 23:59:59'"
```

## 2. Horodatages MACB
- **M** (Modified) : Dernier changement du contenu du fichier.
- **A** (Accessed) : Dernier accès en lecture au fichier.
- **C** (Changed - MFT) : Modification des métadonnées du fichier dans la Master File Table.
- **B** (Born/Created) : Date de création initiale du fichier.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DFIR** | Digital Forensics and Incident Response — Réponse aux incidents et forensique numérique |
| **MFT** | Master File Table — Structure centrale du système de fichiers NTFS répertoriant tous les fichiers |
| **MACB** | Modified, Accessed, Changed, Born — Les 4 horodatages suivis en forensique de fichiers |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel artefact Windows permet de prouver qu'un exécutable spécifique a été lancé sur le système, même s'il a été supprimé par l'attaquant ?
- A) Le fichier Prefetch (`C:\Windows\Prefetch\*.pf`) et l'Amcache (`Amcache.hve`)
- B) Les cookies du navigateur
- C) La table de routage
- D) Le fichier `hosts`

**Réponse : A**

**Q2 :** Que signifie l'acronyme **MACB** dans le contexte d'une analyse de timeline forensique ?
- A) Modified, Accessed, Changed (MFT), Born (Created)
- B) Malware, Antivirus, Cyber, Backup
- C) Memory, Access, Cache, Buffer
- D) Main, Alternate, Control, Block

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
