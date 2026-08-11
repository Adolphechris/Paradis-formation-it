# TOME P10 — DFIR & Reverse Engineering — Jour 443 (6h) : Forensique Disque & Système de Fichiers (Autopsy, The Sleuth Kit, NTFS/Ext4 Artefacts & Timeline Analysis)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser **Autopsy / The Sleuth Kit (TSK)** pour l'analyse forensique de systèmes de fichiers NTFS et Ext4
> - Exploiter les **métadonnées NTFS** : $MFT, $LogFile, $UsnJrnl ($J) pour la reconstruction de timeline
> - Récupérer des **fichiers supprimés** et analyser les **slack space / unallocated clusters**
> - Construire une **Super-Timeline forensique** avec Plaso/log2timeline
>
> **Compétences visées :** `SEC-05` (A) — Disk Forensics, `SEC-04` (A) — Timeline Analysis

---

## Module 1 — NTFS Deep Dive & Artefacts Forensiques (2h)

### 📖 Intuition & Narration

Le système de fichiers NTFS est un témoin implacable. Chaque fichier créé, modifié, déplacé ou supprimé laisse des traces dans au moins quatre structures différentes : la **$MFT** (Master File Table), le **$LogFile** (journal des transactions), le **$UsnJrnl** (journal des changements), et les **timestamps MACB**. Un attaquant qui supprime un fichier croit effacer une preuve — mais Sherlock Holmes que nous sommes sait où regarder.

### 🔍 Anatomie Technique — Structures NTFS Forensiques

```
ARCHITECTURE NTFS — STRUCTURES FORENSIQUES CLÉS

  Volume NTFS
  ├── $MFT (Master File Table)
  │   ├── Un enregistrement par fichier/dossier (1 KB chacun)
  │   ├── Timestamps MACB stockés dans $STANDARD_INFORMATION & $FILE_NAME
  │   └── Attribut $DATA (contenu) — Résidentiel si < 900 bytes, sinon RunList
  │
  ├── $LogFile (Transaction Log — NTFS Journal)
  │   ├── Journalise toutes les opérations de métadonnées NTFS
  │   └── Permet de reconstituer des opérations de fichiers passées
  │
  ├── $UsnJrnl ($Extend\$UsnJrnl — USN Change Journal)
  │   ├── Stream $J : Enregistrement chronologique de TOUS les changements
  │   ├── Chaque entrée : USN, Timestamp, Filename, Reason (CREATE/DELETE/RENAME)
  │   └── Rempli en cycle — Données persistent jusqu'à 3-30 jours selon volume
  │
  └── Unallocated Space (Slack Space)
      ├── Fichiers supprimés : MFT marqué "non-alloué" mais données souvent intactes
      └── File Slack : Fin de cluster partiellement remplie — peut contenir données résiduelles

TIMESTAMPS MACB — LES 4 HORODATAGES NTFS

  ┌────────────────┬──────────────────────────────────────────┐
  │  M — Modified  │  Dernière modification du CONTENU        │
  │  A — Accessed  │  Dernier accès (lecture)                 │
  │  C — Changed   │  Modification des MÉTADONNÉES (attrs)    │
  │  B — Born      │  Date de CRÉATION du fichier             │
  └────────────────┴──────────────────────────────────────────┘
  
  ⚠️ TIMESTOMPING : Technique anti-forensique modifiant les timestamps
  $STANDARD_INFORMATION est modifiable par l'attaquant MAIS
  $FILE_NAME est uniquement modifiable par le kernel → Comparer les deux !
```

### 🛠️ Atelier Pratique — The Sleuth Kit CLI

```bash
# ═══════════════════════════════════════════════
# THE SLEUTH KIT — Analyse NTFS en ligne de commande
# ═══════════════════════════════════════════════

IMAGE="evidence_win.dd"

# 1. Identifier les partitions dans l'image disque
mmls $IMAGE
# → Affiche le tableau de partitions (MBR/GPT)
# Note le slot et l'offset de la partition NTFS (ex: offset 2048)

# 2. Informations sur le filesystem
fsstat -o 2048 $IMAGE

# 3. Lister les fichiers à la racine
fls -o 2048 $IMAGE -r | head -50
# "-r" = récursif ; "r/r" = fichier régulier ; "d/d" = répertoire

# 4. Lister les fichiers SUPPRIMÉS (marqués non-alloués)
fls -o 2048 $IMAGE -d
# "-d" = affiche uniquement les entrées supprimées

# 5. Extraire un fichier spécifique par inode
istat -o 2048 $IMAGE <INODE>       # Informations sur l'inode
icat -o 2048 $IMAGE <INODE> > /tmp/recovered_file.doc  # Extraction

# 6. Rechercher une chaîne dans l'espace non-alloué
blkls -o 2048 $IMAGE | strings | grep -i "password\|credential\|secret"

# 7. Extraire et analyser $MFT
fls -o 2048 $IMAGE | grep -i "\$MFT"  # Trouver l'inode $MFT
icat -o 2048 $IMAGE 0 > /tmp/MFT.raw  # Extraire la $MFT (inode 0)

# 8. Analyser la $UsnJrnl avec tool python
icat -o 2048 $IMAGE <usnjrnl_inode> > /tmp/UsnJrnl_J.raw
# Analyser avec mftdump ou usn-analytics
python3 -m usn -f /tmp/UsnJrnl_J.raw | head -100
```

---

## Module 2 — Super-Timeline Forensique avec Plaso/log2timeline (2h)

### 📖 Intuition & Narration

Reconstituer le fil des événements lors d'un incident, c'est comme résoudre un puzzle en 5 000 pièces sans voir la boîte. Les artefacts forensiques sont dispersés : logs Windows, timestamps filesystem, artefacts browser, prefetch, registry... La **Super-Timeline** est l'outil qui rassemble TOUS ces artefacts sur un axe temporel unique et cohérent.

**Plaso (Plaso Langar Þá Allt Saman)** — "rassemble tout" en islandais — est l'outil de référence pour construire ces super-timelines à partir de centaines de sources d'artefacts.

### 🔍 Anatomie Technique — Pipeline Plaso

```
PIPELINE PLASO — CONSTRUCTION DE SUPER-TIMELINE

  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
  │  Sources    │────▶│  log2timeline │────▶│  plaso.sqlite   │
  │  Artefacts  │     │  (parseurs)   │     │  (Timeline DB)  │
  └─────────────┘     └──────────────┘     └────────┬────────┘
                                                    │
                       ┌────────────────────────────▼───────────┐
                       │  psort — Filtrage & Export              │
                       │  → CSV, JSON, XLSX, ElasticSearch       │
                       └────────────────────────────────────────┘

SOURCES PARSÉES PAR LOG2TIMELINE :
  ✅ Windows Event Logs (EVTX)          ✅ $MFT, $UsnJrnl, $LogFile
  ✅ Registry (SAM, SOFTWARE, SYSTEM)   ✅ Prefetch files
  ✅ Browser History (Chrome/FF/Edge)   ✅ LNK files / Jump Lists
  ✅ Shellbags                          ✅ Syslog, wtmp, auth.log (Linux)
  ✅ IIS/Apache access logs             ✅ PDF/Office metadata
```

### 🛠️ Atelier Pratique — Pipeline log2timeline + psort

```bash
# ═══════════════════════════════════════════════════════
# PLASO — SUPER-TIMELINE FORENSIQUE
# ═══════════════════════════════════════════════════════

# Installation
pip3 install plaso

# ÉTAPE 1 — Extraction des artefacts (peut durer 30-60 min)
log2timeline.py \
    --storage-file /evidence/INC-2024.plaso \
    --parsers all \
    /dev/sdb  # Disque entier, ou image .dd

# ÉTAPE 2 — Filtrage et export CSV sur une fenêtre temporelle
psort.py \
    -z UTC \
    -o L2tcsv \
    --output-filename /evidence/timeline_INC-2024.csv \
    /evidence/INC-2024.plaso \
    "date > '2024-03-15 08:00:00' AND date < '2024-03-16 18:00:00'"

# ÉTAPE 3 — Analyse avec TimeLine Explorer ou grep
grep -i "malware\|powershell\|cmd.exe\|lsass" /evidence/timeline_INC-2024.csv | head -30

# ÉTAPE 4 — Filtrage par type d'événement spécifique
psort.py \
    -o json \
    --output-filename /evidence/registry_events.json \
    /evidence/INC-2024.plaso \
    "data_type IS 'windows:registry:key_value'"
```

---

## Module 3 — Forensique Autopsy & Récupération de Fichiers Supprimés (1h30)

### 🛠️ Atelier Pratique — Autopsy GUI & Carving avec Foremost

```bash
# ═══════════════════════════════════════════════════════
# FILE CARVING avec FOREMOST (reconstruction sans filesystem)
# Foremost reconstruit les fichiers depuis les raw bytes
# en cherchant des magic bytes (headers/footers)
# ═══════════════════════════════════════════════════════

# Carver tous les types de fichiers connus depuis un dump disque
foremost -t all -i /evidence/evidence_win.dd -o /tmp/carved_files/

# Carver uniquement PDF, DOCX, ZIP et images
foremost -t pdf,doc,zip,jpg,png -i /evidence/evidence_win.dd -o /tmp/carved_selective/

# Rapport de carving
cat /tmp/carved_files/audit.txt

# ═══════════════════════════════════════════════════════
# PHOTOREC — Carving avancé (supporte +480 formats)
# ═══════════════════════════════════════════════════════
photorec /d /tmp/photorec_output /evidence/evidence_win.dd

# ═══════════════════════════════════════════════════════
# ANALYSE AUTOPSY — Principaux modules forensiques
# ═══════════════════════════════════════════════════════

# Autopsy 4.x — Interface graphique
# Cas créé via GUI, ajout de l'image disque, puis :

# Modules d'analyse disponibles :
# ┌─────────────────────────────────────────────────────────┐
# │  Recent Activity      → Registry Autorun, Browser, LNK │
# │  Hash Lookup          → NSRL (Known-Good) + Custom IOC  │
# │  File Type ID         → Mismatch extension/magic bytes  │
# │  EXIF Parser          → GPS coords dans photos          │
# │  Email Parser         → PST/MBOX/EML reconstruction     │
# │  Keyword Search       → Regex sur tout le disque        │
# │  Timeline Analysis    → Timeline graphique par dossier  │
# │  Data Artifact        → USB devices, connected drives   │
# └─────────────────────────────────────────────────────────┘

# Recherche d'IOC spécifique (hash SHA-256 malware connu)
# Dans Autopsy : Tools → Add Hash Sets → importer liste IOC
# → Tous les fichiers matchant seront automatiquement flagués "Notable"
```

### 🚑 Terrain — Retour d'Expérience

**Cas : Timestomping détecté lors d'un audit APT (2023)**

Un analyste DFIR examine un serveur compromis par un groupe APT. Un fichier `winupdate.exe` dans `C:\Windows\Temp\` affiche un timestamp de création `2015-06-14` — la même date que d'autres fichiers Windows légitimes. Suspicious.

Grâce à TSK et la comparaison $STANDARD_INFORMATION vs $FILE_NAME :
- **$STANDARD_INFORMATION (modifiable)** : Born = 2015-06-14
- **$FILE_NAME (kernel uniquement)** : Born = **2024-03-15 02:34:17 UTC**

Le fichier a été créé à 2h34 du matin le 15 mars 2024. L'attaquant a utilisé `timestomp` pour faire croire que le fichier était un composant Windows légitime de 2015. La divergence entre les deux attributs trahit la manipulation.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **USN** | Update Sequence Number — Identifiant unique de chaque entrée dans le journal NTFS $UsnJrnl |
| **MACB** | Modified / Accessed / Changed / Born — Les 4 timestamps forensiques NTFS |
| **TSK** | The Sleuth Kit — Suite d'outils CLI open-source d'analyse forensique de systèmes de fichiers |
| **Slack Space** | Espace résiduel entre la fin des données et la fin d'un cluster — peut contenir des données résiduelles |
| **Timestomping** | Technique anti-forensique modifiant les timestamps NTFS pour dissimuler l'heure réelle de création |

---

## Exercices Pratiques

### Exercice 1 — Détection de Timestomping

**Question :** Un fichier présente ces valeurs :
- `$STANDARD_INFORMATION.Born` : 2019-01-01 00:00:00
- `$FILE_NAME.Born` : 2024-11-05 03:22:41

Que concluez-vous et quelle est la vraie date de création ?

**Corrigé guidé :** Timestomping confirmé. La vraie date de création est **2024-11-05 03:22:41** (from `$FILE_NAME` — modifiable uniquement par le noyau). La date 2019-01-01 est une valeur ronde suspecte (les malwares utilisent souvent des dates rondes pour le camouflage). Les **deux timestamps doivent toujours être comparés** lors d'une analyse forensique NTFS.

### Exercice 2 — Récupération de Fichier Supprimé

Avec `fls -d image.dd`, vous voyez : `r/r * 23456:    secret_doc.docx (deleted)`

**Question :** Quelle commande permet de récupérer le fichier malgré sa suppression ?

**Corrigé guidé :** `icat -o <offset> image.dd 23456 > recovered_secret_doc.docx` — L'inode 23456 est encore accessible car seul le bit d'allocation dans la $MFT a été effacé; les clusters contenant les données n'ont pas encore été réutilisés.

---

## Banque QCM — 5 Questions

**Q1.** Le `$UsnJrnl` (USN Change Journal) NTFS est particulièrement utile en forensique car :

- A) Il stocke le contenu des fichiers supprimés
- B) Il enregistre un historique chronologique de tous les changements de fichiers (créations, suppressions, renommages) ✅
- C) Il contient les mots de passe des fichiers chiffrés
- D) Il journalise les connexions réseau du système

**Q2.** La technique de **Timestomping** anti-forensique peut être détectée en comparant :

- A) Les logs Windows Event vs les logs système Linux
- B) $STANDARD_INFORMATION timestamps vs $FILE_NAME timestamps ✅
- C) Le hash MD5 vs le hash SHA-256 du fichier
- D) La date du $MFT vs la date du $LogFile

**Q3.** Le **File Carving** (avec Foremost ou Scalpel) est nécessaire quand :

- A) Le système de fichiers est intact et fonctionnel
- B) On veut analyser les logs Windows Event
- C) Le système de fichiers est corrompu ou absent, et on reconstruit depuis les raw bytes ✅
- D) On analyse une capture mémoire RAM

**Q4.** Quel attribut NTFS est modifiable UNIQUEMENT par le kernel Windows, rendant sa manipulation difficile pour un attaquant ?

- A) $STANDARD_INFORMATION (SI)
- B) $DATA
- C) $FILE_NAME (FN) ✅
- D) $OBJECT_ID

**Q5.** La commande TSK `fls -d image.dd` affiche :

- A) Tous les fichiers du filesystem, alloués et non-alloués
- B) Uniquement les fichiers supprimés (non-alloués) ✅
- C) Les partitions disponibles dans l'image disque
- D) Les métadonnées SMART du disque

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
