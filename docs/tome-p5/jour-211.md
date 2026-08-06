# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 211 (6h) : Analyse de Logiciels Malveillants (Analyse Statique PEstudio, Analyse Dynamique Cuckoo/ANY.RUN, Règles YARA & Indicators of Compromise)

> [!NOTE]
> **Objectif du jour :** Maîtriser les méthodes d'analyse de logiciels malveillants (**Malware Analysis**) : **analyse statique** de binaires Windows PE (PEstudio, Floss, strings), **analyse dynamique** en environnement Sandbox (Cuckoo Sandbox, ANY.RUN), extraction d'indicateurs de compromission (**IoC**), et rédaction de règles de détection d'entreprise avec **YARA**.
>
> **Compétences visées :** `SEC-06` (A) — Analyse de Malwares Statique & Dynamique | `SEC-04` (A) — Détection YARA Rules & IoCs

---

## 1) Module — Analyse Statique de Binaires Windows PE (2h)

### 📖 Narration/Intuition

Lorsqu'un analyste SOC ou un chercheur en sécurité reçoit un fichier binaire suspect (ex: une pièce jointe exécutable d'un email de phishing prétendant provenir d'une banque partenaire), la première étape consiste à analyser le fichier sans l'exécuter. C'est l'**Analyse Statique**.

L'analyse statique permet de déterminer le type de fichier, d'extraire les chaînes de caractères lisibles (URLs C2, adresses IP, clés de registre), d'inspecter les fonctions importées de l'API Win32 (`kernel32.dll`, `advapi32.dll`), et d'identifier si le fichier est compressé ou obfusqué par un Packer (ex: UPX).

### 🔍 Anatomie Technique

**Structure d'un Fichier Exécutable Windows PE (Portable Executable) :**

```
┌─────────────────────────────────────────────────────────────┐
│                     DOS HEADER (MZ)                         │
│  - Signature "MZ" (Mark Zbikowski)                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PE HEADER (PE\0\0)                       │
│  - Target Machine (x86 / x64)                               │
│  - Timestamp de compilation                                 │
│  - Nombre de sections                                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   SECTION HEADERS                           │
│  - .text   : Code exécutable binaire (Instructions CPU)    │
│  - .data   : Données globales initialisées                   │
│  - .rdata  : Constantes et Table des Importations (IAT)     │
│  - .rsrc   : Ressources (Icônes, Dialogues, Manifeste)     │
└─────────────────────────────────────────────────────────────┘
```

**Analyse avec PEstudio & Floss :**

```bash
# 1. Extraire les chaînes obfuscées avec Floss (Mandiant FLOSS)
floss suspicious_file.exe > extracted_strings.txt

# 2. Inspecter les Importations d'APIs Win32 Suspectes :
#   - VirtualAlloc / WriteProcessMemory / CreateRemoteThread ──► Injection de Code dans un autre processus
#   - InternetOpenA / HttpSendRequestA                      ──► Communication réseau / C2
#   - RegSetValueExA / CreateServiceA                       ──► Mécanisme de Persistance
#   - IsDebuggerPresent / CheckRemoteDebuggerPresent        ──► Anti-Debugging / Evasion Sandbox
```

---

## 2) Module — Analyse Dynamique en Sandbox & Behavior Analysis (2h)

### 📖 Narration/Intuition

L'**Analyse Dynamique** consiste à exécuter le binaire malveillant dans un environnement virtuel totalement isolé et surveillé (**Sandbox**) pour observer ses actions réelles en temps réel : fichiers créés ou modifiés, clés de registre altérées, requêtes DNS envoyées, et processus enfants lancés.

### 🔍 Anatomie Technique

**Indicateurs Comportementaux Observés lors de l'Analyse Dynamique :**

```
                  ┌────────────────────────────────────────┐
                  │       EXÉCUTION DU MALWARE (Sandbox)   │
                  └───────────────────┬────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌──────────────┐               ┌──────────────┐              ┌──────────────┐
│ ACTES RÉSEAU │               │ FICHIERS/REG │              │  PROCESSUS   │
│- Requête DNS │               - Création dans│              - Injection dans│
│  dga-domain  │                 AppData\Temp │                lsass.exe    │
│- Connexion C2│               - Clé Run/RunOnce             - Lancement de │
│  HTTPS:443   │                 (Persistance)│                cmd /c vss...│
└──────────────┘               └──────────────┘              └──────────────┘
```

---

## 3) Module — Rédaction de Règles YARA & Extraction d'IoCs (2h)

### 📖 Narration/Intuition

Une fois les caractéristiques uniques d'une famille de malwares identifiées, l'analyste rédige une **Règle YARA**. YARA est le couteau suisse des chercheurs en sécurité : il permet de classifier et de rechercher des malwares en fonction de patterns textuels ou binaires spécifiques.

### 🛠️ Atelier Pratique

**Règle YARA pour la Détection de Ransomware Bancaire (`bcc_ransomware.yar`) :**

```yara
rule BCC_Ransomware_Detector {
    meta:
        description = "Détecte les ransomwares bancaires ciblant l'infrastructure BCC"
        author = "SOC Team BCC"
        reference = "BCC-MALWARE-2026-09"
        date = "2026-06-17"
        severity = "CRITICAL"

    strings:
        // Signature d'en-tête PE Windows
        $pe_magic = "MZ"

        // Chaînes de caractères caractéristiques du ransomware (Note de rançon / API)
        $msg1 = "Vos fichiers ont été chiffrés par l'équipe" nocase
        $msg2 = "vssadmin.exe Delete Shadows /All /Quiet" ascii wide
        $msg3 = "DECRYPT_FILES.html" ascii

        // Clés de registre de persistance ciblées
        $reg = "Software\\Microsoft\\Windows\\CurrentVersion\\Run" ascii

        // Motif de signature binaire hexadécimale (Shellcode d'injection)
        $hex_pattern = { 48 83 EC 28 E8 ?? ?? ?? ?? 48 89 Pt }

    condition:
        // Le fichier doit être un exécutable PE Windows
        uint16(0) == 0x5D4D and

        // Taille de fichier inférieure à 10 Mo
        filesize < 10MB and

        // Détection de la note de rançon OU de l'exécution vssadmin + pattern hex
        ($msg1 or $msg2 or $msg3) and $reg
}
```

**Commande d'exécution YARA pour scanner un répertoire de serveurs :**

```bash
# Scanner le répertoire de stockage avec la règle YARA créée
yara -r bcc_ransomware.yar /var/log/uploads/

# Résultat : Signale immédiatement tout fichier correspondant à la signature du malware !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PE** | Portable Executable — Format standard des fichiers exécutables Windows (`.exe`, `.dll`) |
| **YARA** | Pattern matching swiss knife for malware researchers |
| **IAT** | Import Address Table — Table des fonctions d'APIs externes importées par un binaire |
| **FLOSS** | FLARE Obfuscated String Solver — Outil Mandiant d'extraction automatique de chaînes obfusquées |
| **MZ** | Signature d'en-tête (Mark Zbikowski) marquant le début d'un fichier exécutable DOS/Windows |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre l'**Analyse Statique** et l'**Analyse Dynamique** d'un logiciel malveillant, et pourquoi est-il recommandé de commencer par l'analyse statique ?

**Corrigé :** L'**Analyse Statique** inspecte la structure, le code binaire et les métadonnées d'un malware **sans l'exécuter**, réduisant ainsi à zéro le risque d'infection de la machine d'analyse. L'**Analyse Dynamique** consiste à **exécuter le malware** dans une Sandbox surveillée pour observer son comportement réel en mémoire, sur le réseau et sur le système de fichiers. Il est impératif de commencer par l'analyse statique car elle fournit des informations préalables essentielles (fonctions importées, obfuscation, détection d'anti-analyse) qui permettent d'armer correctement la Sandbox d'analyse dynamique et d'éviter que le malware ne détecte la Sandbox pour masquer son comportement.

**Exercice 2 :** Pourquoi la présence de la chaîne `vssadmin.exe Delete Shadows /All /Quiet` dans un binaire Windows est-elle un indicateur de forte suspicion d'une activité de **Ransomware** ?

**Corrigé :** La commande Windows `vssadmin.exe Delete Shadows` supprime l'intégralité des instantanés de volumes (**Volume Shadow Copies**), c'est-à-dire les sauvegardes locales automatiques créées par Windows. Les logiciels malveillants de type **Ransomware** exécutent systématiquement cette commande avant d'entamer le chiffrement des fichiers pour empêcher la victime de restaurer ses fichiers gratuitement à partir des snapshots système Windows. La présence de cette chaîne dans les imports ou les strings d'un binaire non système est une signature comportementale quasi-certaine d'une intention destructrice de type Ransomware.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel format de fichier est le standard des binaires exécutables sous les systèmes d'exploitation Microsoft Windows (`.exe`, `.dll`) ?
- A) PE (Portable Executable)
- B) ELF
- C) APK
- D) DMG

**Réponse : A**

**Q2 :** Quel outil open-source développé par VirusTotal permet aux chercheurs en sécurité de rédiger des règles basées sur des motifs textuels ou hexadécimaux pour classifier et détecter des familles de malwares ?
- A) YARA
- B) Nmap
- C) Wireshark
- D) Docker

**Réponse : A**

**Q3 :** Quelle est la signature de deux octets (Magic Bytes) présente au tout début de chaque fichier exécutable DOS/Windows PE ?
- A) `MZ` (0x4D5A)
- B) `PK`
- C) `ELF`
- D) `PDF`

**Réponse : A**

**Q4 :** Quel est l'objectif principal d'un environnement **Sandbox** (ex: Cuckoo Sandbox) dans l'analyse de malwares ?
- A) Exécuter le malware de manière sécurisée et isolée pour observer son comportement réel en temps réel (fichiers créés, requêtes C2)
- B) Décompiler le code C++ en Java
- C) Supprimer les virus de l'ordinateur
- D) Augmenter la vitesse du processeur

**Réponse : A**

**Q5 :** Quel outil développé par Mandiant permet d'extraire automatiquement les chaînes de caractères obfusquées ou chiffrées cachées dans un binaire malveillant ?
- A) FLOSS
- B) Notepad
- C) Ping
- D) Calculator

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
