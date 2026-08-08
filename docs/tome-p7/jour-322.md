# TOME P7 — Certifications d'Élite & Spécialisations — Jour 322 (6h) : GREM Prep — Ransomware Analysis (ChaCha20 File Encryption, VSS Deletion, WMI Event Subscription Persistence & C2 Beacon Analysis)

> [!NOTE]
> **Objectif du jour :** Analyser un **ransomware moderne** de A à Z dans le contexte de la certification **GREM** : comprendre le mécanisme de **chiffrement hybride** (RSA-4096 + ChaCha20 par fichier), identifier les techniques de **persistance** (WMI Event Subscription, Registry Run keys), détecter la **suppression des VSS (Volume Shadow Copies)**, et analyser le **trafic réseau C2** (beacon, key exchange, exfiltration pré-chiffrement).
>
> **Compétences visées :** `GREM-03` (A) — Ransomware Encryption Mechanism Analysis | `GREM-04` (A) — WMI Persistence & VSS Deletion Detection

---

## 1) Module — Mécanisme de Chiffrement Hybride Ransomware (2h)

### 📖 Narration/Intuition

Les ransomwares modernes (REvil/Sodinokibi, Conti, LockBit 3.0) utilisent un **chiffrement hybride** en 3 phases :

```
Phase 1 — Clé de chiffrement de fichier
  └── Génère une clé unique ChaCha20 (256 bits) + Nonce (96 bits) PER FILE

Phase 2 — Protection de la clé de fichier
  └── Chiffre la clé ChaCha20 avec la clé publique RSA-4096 du C2
      → Seul le C2 possède la clé privée RSA → Décryptage impossible sans payer

Phase 3 — Chiffrement du fichier
  └── Chiffre le contenu du fichier avec ChaCha20 (streaming, ultra-rapide)
  └── Append le blob RSA(ChaCha20_key) à la fin du fichier chiffré
  └── Renomme le fichier : document.pdf → document.pdf.lockbit
```

---

## 2) Module — Analyse du Ransomware : VSS Deletion, Persistance & C2 (`ransomware_analysis.py`) (2h)

### 🛠️ Atelier Pratique

```python
# Analyse comportementale d'un ransomware — Indicateurs clés à détecter
# Contexte : Analyse du rapport de sandbox (Cuckoo/Any.Run/JoeSandbox)

ransomware_iocs = {
    "sample": "lockbit3_sample.exe",
    "sha256": "a3f2b9c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",

    # ─────────────────────────────────────────────────────────────────────
    # 1) SUPPRESSION DES SHADOW COPIES (Empêche la restauration Windows)
    # ─────────────────────────────────────────────────────────────────────
    "vss_deletion_commands": [
        "vssadmin.exe delete shadows /all /quiet",
        "wmic shadowcopy delete",
        "bcdedit /set {default} bootstatuspolicy ignoreallfailures",
        "bcdedit /set {default} recoveryenabled no",
        "wbadmin delete catalog -quiet",
        "schtasks /Delete /TN 'WindowsBackup' /F"
    ],

    # ─────────────────────────────────────────────────────────────────────
    # 2) PERSISTANCE — WMI Event Subscription (survit aux reboots)
    # ─────────────────────────────────────────────────────────────────────
    "wmi_persistence": {
        "event_filter": "__EventFilter WHERE Name='LockBitMalwarePersistence'",
        "trigger": "SELECT * FROM __InstanceModificationEvent WITHIN 60 WHERE TargetInstance ISA 'Win32_PerfFormattedData_PerfOS_System'",
        "consumer": "CommandLineEventConsumer → C:\\Users\\Public\\malware.exe",
        "binding": "__FilterToConsumerBinding"
    },

    # ─────────────────────────────────────────────────────────────────────
    # 3) RÉSEAU C2 — Beacon & Key Exchange
    # ─────────────────────────────────────────────────────────────────────
    "network_iocs": {
        "c2_domains": ["lockbit3.onion", "backup-c2.ru", "185.220.101.47"],
        "beacon_interval_seconds": 60,
        "beacon_jitter_pct": 20,
        "initial_c2_call": "HTTP POST /api/register — Envoie: hostname, username, domain, CPU info, IP, list des drives",
        "key_exchange": "HTTP POST /api/pubkey — Reçoit: RSA-4096 Public Key du C2",
        "encryption_complete": "HTTP POST /api/complete — Envoie: Liste des fichiers chiffrés + clés ChaCha20 chiffrées"
    },

    # ─────────────────────────────────────────────────────────────────────
    # 4) EXTENSIONS FICHIERS CIBLÉES
    # ─────────────────────────────────────────────────────────────────────
    "targeted_extensions": [".doc", ".docx", ".xls", ".xlsx", ".pdf", ".sql", ".mdf", ".bak", ".vmdk", ".vhd"],
    "excluded_extensions": [".exe", ".dll", ".sys", ".lockbit"],  # S'exclut lui-même
    "excluded_dirs": ["C:\\Windows", "C:\\Program Files\\Windows Defender", "$Recycle.Bin"],

    # ─────────────────────────────────────────────────────────────────────
    # 5) CLÉS DE REGISTRE DE PERSISTANCE SUPPLÉMENTAIRES
    # ─────────────────────────────────────────────────────────────────────
    "registry_persistence": [
        "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run → malware.exe",
        "HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\\Shell → malware.exe"
    ]
}

def print_ransomware_report():
    print(f"=== RANSOMWARE IOC REPORT — {ransomware_iocs['sample']} ===")
    print(f"SHA256 : {ransomware_iocs['sha256']}\n")

    print("[!] Commandes de suppression VSS détectées :")
    for cmd in ransomware_iocs['vss_deletion_commands']:
        print(f"  $ {cmd}")

    print(f"\n[!] C2 Network IOCs :")
    print(f"  Domains : {', '.join(ransomware_iocs['network_iocs']['c2_domains'])}")
    print(f"  Beacon : toutes les {ransomware_iocs['network_iocs']['beacon_interval_seconds']}s (±{ransomware_iocs['network_iocs']['beacon_jitter_pct']}%)")

    print(f"\n[!] WMI Persistence détectée : {ransomware_iocs['wmi_persistence']['consumer']}")

print_ransomware_report()
```

---

## 3) Module — Règles YARA de Détection Ransomware (`ransomware_detect.yar`) (2h)

```yara
/*
 * Règle YARA : Détection de comportement ransomware (LockBit 3.0 / Conti style)
 * GREM — Indicator of Compromise Signature
 */
rule Ransomware_LockBit3_Behavior
{
    meta:
        description = "Détecte les comportements caractéristiques du ransomware LockBit 3.0"
        author      = "PARADIS IT — GREM Prep"
        date        = "2026-08-07"
        severity    = "CRITICAL"

    strings:
        /* Suppression des Shadow Copies */
        $vss1 = "vssadmin.exe delete shadows" ascii nocase
        $vss2 = "wmic shadowcopy delete" ascii nocase
        $vss3 = "bcdedit /set {default} recoveryenabled no" ascii nocase

        /* Extensions ransomware LockBit */
        $ext1 = ".lockbit" ascii
        $ext2 = "!!! README_LOCKBIT.txt" ascii

        /* C2 Registration Pattern */
        $c2_api1 = "/api/register" ascii
        $c2_api2 = "/api/pubkey" ascii
        $c2_api3 = "/api/complete" ascii

        /* Chiffrement ChaCha20 magic bytes */
        $chacha20 = { 65 78 70 61 6E 64 20 33 32 2D 62 79 74 65 } // "expand 32-byte"

        /* WMI Persistence strings */
        $wmi1 = "Win32_PerfFormattedData_PerfOS_System" ascii
        $wmi2 = "CommandLineEventConsumer" ascii

    condition:
        uint16(0) == 0x5A4D and  // Header PE valide (MZ)
        (
            2 of ($vss*) or
            (1 of ($c2_api*) and 1 of ($ext*)) or
            ($chacha20 and 1 of ($c2_api*)) or
            (1 of ($wmi*) and 1 of ($vss*))
        )
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VSS** | Volume Shadow Service — Service Windows permettant les points de restauration et backups snapshot |
| **WMI** | Windows Management Instrumentation — Framework Windows d'administration et de persistance malware |
| **ChaCha20** | Algorithme de chiffrement par flux (stream cipher) rapide, utilisé par les ransomwares modernes |
| **YARA** | Yet Another Ridiculous Acronym — Moteur de règles de correspondance pour détecter des malwares |
| **Beacon** | Signal périodique d'un malware vers son serveur C2 (Command & Control) |
| **IOC** | Indicator of Compromise — Indicateur de compromission (hash, IP, domaine, pattern comportemental) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi les ransomwares modernes suppriment-ils les **Volume Shadow Copies (VSS)** ?
- A) Pour empêcher la victime de restaurer ses fichiers via les points de restauration Windows natifs (Versions précédentes), forçant ainsi le paiement de la rançon
- B) Pour libérer de l'espace disque
- C) Pour masquer leur présence aux antivirus
- D) Pour accélérer le chiffrement

**Réponse : A**

**Q2 :** Pourquoi les ransomwares utilisent-ils un **chiffrement hybride (RSA + ChaCha20)** plutôt que RSA seul pour chiffrer tous les fichiers ?
- A) RSA est trop lent pour chiffrer de grandes quantités de fichiers — ChaCha20 (stream cipher) est des milliers de fois plus rapide ; RSA est utilisé uniquement pour protéger la clé ChaCha20
- B) ChaCha20 est plus fort que RSA
- C) RSA ne supporte pas les fichiers > 1MB
- D) Pour contourner Windows Defender

**Réponse : A**

**Q3 :** Qu'est-ce que la persistance via **WMI Event Subscription** dans un ransomware ?
- A) Un mécanisme permettant au malware de s'exécuter automatiquement à chaque démarrage via un événement WMI (EventFilter + CommandLineEventConsumer + FilterToConsumerBinding), sans écriture dans les clés Run du registre
- B) Une technique de chiffrement
- C) Une méthode d'injection dans le processus explorer.exe
- D) Un protocole de communication C2

**Réponse : A**

**Q4 :** Dans une règle YARA, quelle condition vérifie qu'un fichier est un **binaire PE valide** (exécutable Windows) ?
- A) `uint16(0) == 0x5A4D` — Vérifie la présence du magic header MZ (0x4D5A en little-endian) au début du fichier
- B) `filesize < 1MB`
- C) `pe.is_32bit()`
- D) `all of ($strings*)`

**Réponse : A**

**Q5 :** Dans l'analyse forensique d'un incident ransomware, quel artefact Windows permet de confirmer l'heure exacte d'exécution du ransomware sur le système ?
- A) Les Prefetch files (`C:\Windows\Prefetch\MALWARE.EXE-XXXXXXXX.pf`) combinés aux logs d'événements Windows (Event ID 4688 — Process Creation)
- B) Le fichier `hosts`
- C) Le cache ARP
- D) Les cookies du navigateur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
