# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 367 (6h) : NTFS & File System Forensics — Low-Level Parsing ($MFT, USN Journal, $LogFile, INDX & Volume Shadow Copies Recovery)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse forensique à bas niveau du système de fichiers **NTFS (New Technology File System)** : disséquer les structures de la **Master File Table ($MFT)** et de l'attribut `$STANDARD_INFORMATION` vs `$FILE_NAME`, traquer le **Timestomping** (falsification d'horodatage), extraire les preuves d'actions depuis le **USN Journal ($UsnJrnl)** et le **$LogFile**, et récupérer les artefacts de versions antérieures via les **Volume Shadow Copies (VSS)**.
>
> **Compétences visées :** `DFIR-NTFS-01` (A) — Low-Level $MFT & USN Journal Parsing | `DFIR-NTFS-02` (A) — Timestomping Detection & Volume Shadow Copy Evidence Recovery

---

## 1) Module — Anatomie Bas Niveau NTFS ($MFT & Timestomping) (2h)

### 📖 Narration/Intuition

Chaque fichier ou dossier sur une partition NTFS possède au moins une entrée dans la **Master File Table ($MFT)**. Les informations de dates et heures (MACB) sont stockées dans deux attributs distincts de l'entrée $MFT :
1. **`$STANDARD_INFORMATION` ($SI) :** Utilisé par l'Explorateur Windows et modifiable par les API utilisateur (facilement falsifiable par un attaquant $\rightarrow$ **Timestomping**).
2. **`$FILE_NAME` ($FN) :** Mis à jour uniquement par le noyau système lors des opérations système de fichiers (très difficile à falsifier sans accès physique brut).

```
 ┌─────────────────────────────────────────────────────────────┐
 │ MFT ENTRY #1042 (document_secret.docx)                      │
 ├─────────────────────────────────────────────────────────────┤
 │ Attribut $STANDARD_INFORMATION ($SI)                        │
 │  - Created (B): 2020-01-01 00:00:00  <--- FALSIFIÉ (Timestomped!)│
 ├─────────────────────────────────────────────────────────────┤
 │ Attribut $FILE_NAME ($FN)                                   │
 │  - Created (B): 2026-08-08 04:12:00  <--- VRAIE DATE DE CRÉATION !│
 └─────────────────────────────┬───────────────────────────────┘
                               │ (Analyse Différentielle $SI vs $FN)
                               ▼
        [ TIMESTOMPING DETECTED : INCONGRUENCE $SI < $FN ]
```

---

## 2) Module — Outillage NTFS Parser & Timestomp Detector (`ntfs_mft_analyzer.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import Dict, List

class NTFSMFTAnalyzer:
    """
    Analyseur forensique des entrées $MFT et décteur de Timestomping
    par comparaison différentielle des attributs $STANDARD_INFORMATION ($SI) et $FILE_NAME ($FN).
    """

    def __init__(self, evidence_filename: str):
        self.filename = evidence_filename
        self.mft_records: List[dict] = []
        self.anomalies: List[dict] = []

    def inspect_mft_record(self, record_id: int, file_path: str, si_dates: dict, fn_dates: dict) -> dict:
        """
        Compare les dates MACB de $STANDARD_INFORMATION et $FILE_NAME.
        si_dates / fn_dates format: {"created": timestamp_epoch, "modified": timestamp_epoch}
        """
        si_created = si_dates.get("created", 0)
        fn_created = fn_dates.get("created", 0)

        # Règle de détection de Timestomping :
        # Si la date de création $SI est antérieure à la date de création $FN (si_created < fn_created),
        # l'attaquant a utilisé un outil comme NTimestomp ou Meterpreter 'timestomp' !
        is_timestomped = si_created < (fn_created - 10) # Marge de 10s pour les deltas système

        result = {
            "record_id": record_id,
            "file_path": file_path,
            "si_created_utc": datetime.fromtimestamp(si_created, tz=timezone.utc).isoformat(),
            "fn_created_utc": datetime.fromtimestamp(fn_created, tz=timezone.utc).isoformat(),
            "timestomp_detected": is_timestomped
        }

        if is_timestomped:
            anomaly = {
                "record_id": record_id,
                "file_path": file_path,
                "type": "TIMESTOMPING_DETECTED",
                "severity": "HIGH",
                "details": f"La date $SI ({result['si_created_utc']}) est antérieure à la date système $FN ({result['fn_created_utc']})."
            }
            self.anomalies.append(anomaly)
            print(f"[!] TIMESTOMPING DÉTECTÉ sur {file_path} (Record #{record_id})")

        self.mft_records.append(result)
        return result

# Démonstration Forensique NTFS
analyzer = NTFSMFTAnalyzer("MFT_Dump.raw")

print("=== LOW-LEVEL NTFS MFT & TIMESTOMP ANALYZER ===")

# Test 1 : Fichier légitime ($SI == $FN)
analyzer.inspect_mft_record(
    record_id=1050,
    file_path="C:\\Windows\\System32\\cmd.exe",
    si_dates={"created": 1700000000},
    fn_dates={"created": 1700000000}
)

# Test 2 : Fichier malveillant avec Timestomping (SI fustigé dans le passé à 2015)
analyzer.inspect_mft_record(
    record_id=4092,
    file_path="C:\\Users\\Public\\malware_dropper.exe",
    si_dates={"created": 1420070400}, # Année 2015 (Falsifié)
    fn_dates={"created": 1723090000}  # Année 2026 (Vraie installation)
)

print("\n=== RAPPORT D'ANOMALIES NTFS ($MFT) ===")
print(json.dumps(analyzer.anomalies, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche technique USN Journal & Volume Shadow Copies (2h)

```markdown
# FORENSIQUE NTFS : USN JOURNAL & VOLUME SHADOW COPIES (VSS)

## 1. USN Journal ($UsnJrnl / $J)
Le **USN Journal (Update Sequence Number)** enregistre toutes les modifications apportées aux fichiers (création, suppression, renommage, écriture) en mode append-only :
- **Révélation des fichiers supprimés :** Même si le fichier est supprimé de la MFT, l'enregistrement de sa suppression et de son ancien nom reste dans le `$UsnJrnl`.
- **Détection des ransomwares :** Analyse du burst d'événements `USN_REASON_DATA_OVERWRITE` + `USN_REASON_FILE_CREATE` avec de nouvelles extensions.

## 2. Exploitation des Volume Shadow Copies (VSS)
Les VSS conservent des snapshots passés du système de fichiers :
```bash
# Lister les Volume Shadow Copies disponibles
vssadmin list shadows /for=C:

# Monter une Shadow Copy pour extraire un fichier supprimé par un ransomware
mklink /d C:\ShadowCopy_Mount \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **$MFT** | Master File Table — Base de données système répertoriant tous les fichiers et dossiers NTFS |
| **USN Journal** | Change Journal NTFS traçant l'historique des modifications de fichiers |
| **Timestomping** | Technique d'anti-forensique modifiant les dates MACB d'un fichier pour le faire passer pour un binaire système ancien |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence fondamentale entre les attributs **`$STANDARD_INFORMATION` ($SI)** et **`$FILE_NAME` ($FN)** dans une entrée $MFT NTFS ?
- A) L'attribut `$SI` est modifiable par les API utilisateur (et sujet au Timestomping), alors que `$FN` est géré exclusivement par le noyau et conserve la vraie date d'origine
- B) `$SI` gère le réseau, `$FN` les images
- C) `$FN` est supprimé lors du redémarrage
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Comment la comparaison entre les dates `$SI` et `$FN` permet-elle de détecter une tentative de **Timestomping** ?
- A) Si la date de création dans `$SI` est antérieure à la date de création dans `$FN`, cela prouve que la date utilisateur a été manipulée dans le passé pour masquer l'artefact
- B) Si le fichier est en lecture seule
- C) Si la taille du fichier est nulle
- D) Si le nom du fichier est en majuscules

**Réponse : A**

**Q3 :** Quel artefact NTFS conserve l'historique des opérations de suppression et de renommage de fichiers sous forme de journal continu ?
- A) Le USN Journal (`$UsnJrnl::$J`)
- B) Le fichier hosts
- C) La table ARP
- D) Le spouleur d'impression

**Réponse : A**

**Q4 :** Pourquoi les **Volume Shadow Copies (VSS)** sont-elles précieuses lors d'une investigation après une attaque de Ransomware ?
- A) Elles permettent de remonter dans le temps et de récupérer des versions non chiffrées des fichiers et des ruches du registre datant d'avant l'attaque
- B) Elles augmentent la mémoire RAM
- C) Elles suppriment le virus automatiquement
- D) Elles changent les mots de passe des administrateurs

**Réponse : A**

**Q5 :** Qu'est-ce que l'horodatage **MACB** en forensique système de fichiers ?
- A) Modified, Accessed, Changed ($MFT), Born (Created)
- B) Master, Access, Control, Byte
- C) Memory, Agent, Client, Buffer
- D) Main, Alternate, Channel, Block

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
