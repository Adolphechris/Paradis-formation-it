# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 371 (6h) : Malware Analysis Fundamentals — Static Analysis (PE Headers, Strings, YARA Rules & Import Hash Fingerprinting)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse **statique** des binaires malveillants sans les exécuter : disséquer la structure du format **PE (Portable Executable)** Windows (Headers, Sections `.text`, `.data`, `.rsrc`), extraire les chaînes de caractères (`strings`), analyser la table d'importation (Import Address Table — IAT) pour déduire les capacités du malware, calculer l'**Import Hash (ImpHash)** pour le clustering de familles de malwares, et écrire des signatures **YARA** de détection.
>
> **Compétences visées :** `MAL-STATIC-01` (A) — PE Format Dissection, Strings Extraction & IAT Analysis | `MAL-STATIC-02` (A) — ImpHash Clustering, Entropy Analysis & YARA Rule Authoring

---

## 1) Module — Anatomie du Format PE Windows & Red Flags Statiques (2h)

### 📖 Narration/Intuition

Avant même d'exécuter un fichier suspect dans un bac à sable (Sandbox), l'analyste DFIR peut extraire une quantité considérable de renseignements par l'analyse statique de la structure binaire brute. Un seul fichier `.exe` trahit ses intentions à travers sa structure interne.

```
   ┌─────────────────────────────────────────────────────────────────┐
   │                 STRUCTURE D'UN BINAIRE PE WINDOWS               │
   ├─────────────────────────────────────────────────────────────────┤
   │ DOS Header (MZ Signature : 0x4D5A)                              │
   ├─────────────────────────────────────────────────────────────────┤
   │ PE Header (Signature 0x5045 "PE\0\0" / Magic Number)            │
   │   - Machine Type (x86 / x64)                                    │
   │   - Number of Sections                                          │
   │   - Timestamp de Compilation                                    │
   ├─────────────────────────────────────────────────────────────────┤
   │ Section .text  (Code Exécutable)                                │
   │ Section .data  (Variables Initialisées)                         │
   │ Section .rsrc  (Ressources : icônes, DLLs embarquées)           │
   │ Section .packed (Entropy élevée > 7.0 ──► UPX / MPRESS Pack)   │
   ├─────────────────────────────────────────────────────────────────┤
   │ Import Address Table (IAT) ────► Liste des DLLs & Fonctions     │
   │   - VirtualAlloc / WriteProcessMemory ──► Injection Mémoire !   │
   │   - CryptEncrypt / CryptAcquireContext ──► Chiffrement (Ransom) │
   │   - WSAConnect / GetAddrInfoW ──────────► Réseau / C2 Beacon   │
   └─────────────────────────────────────────────────────────────────┘
```

#### Fonctions API Windows Critiques — Red Flags par Catégorie

| Catégorie d'Attaque | Fonctions API IAT Suspectes | Capacité Malware Déduite |
|:---:|:---|:---|
| **Injection de Code** | `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread` | Process Injection / Hollowing |
| **Persistence Registry** | `RegSetValueExA`, `RegCreateKeyExA` | Clé Run / Service Backdoor |
| **Réseau C2** | `WSAStartup`, `WSAConnect`, `URLDownloadToFileA` | Beaconing C2 / Downloader |
| **Chiffrement (Ransomware)** | `CryptEncrypt`, `CryptGenKey`, `BCryptEncrypt` | Chiffrement de fichiers |
| **Anti-Debug** | `IsDebuggerPresent`, `CheckRemoteDebuggerPresent`, `NtQueryInformationProcess` | Évasion d'analyse |

---

## 2) Module — Outillage Static Analysis Engine (`static_malware_analyzer.py`) (2h)

### 🛠️ Atelier Pratique

```python
import hashlib
import math
import json
from typing import List, Dict

class StaticMalwareAnalyzer:
    """
    Moteur d'analyse statique de binaires PE Windows.
    Calcule l'entropie de Shannon par section, détecte les chaînes suspectes et génère l'ImpHash.
    """

    SUSPICIOUS_IMPORTS = {
        "VirtualAllocEx":           "MEMORY_INJECTION",
        "WriteProcessMemory":       "MEMORY_INJECTION",
        "CreateRemoteThread":       "MEMORY_INJECTION",
        "RegSetValueExA":           "PERSISTENCE_REGISTRY",
        "RegCreateKeyExA":          "PERSISTENCE_REGISTRY",
        "CryptEncrypt":             "RANSOMWARE_ENCRYPTION",
        "BCryptEncrypt":            "RANSOMWARE_ENCRYPTION",
        "IsDebuggerPresent":        "ANTI_DEBUG_EVASION",
        "NtQueryInformationProcess":"ANTI_DEBUG_EVASION",
        "URLDownloadToFileA":       "C2_NETWORK_DOWNLOADER",
        "WSAConnect":               "C2_NETWORK_BEACON"
    }

    def __init__(self, sample_path: str, raw_bytes: bytes):
        self.path = sample_path
        self.raw = raw_bytes
        self.findings: List[dict] = []

    def calculate_entropy(self, data: bytes) -> float:
        """Calcule l'entropie de Shannon. Valeur > 7.0 indique compression/chiffrement (packing)."""
        if not data:
            return 0.0
        freq = {}
        for byte in data:
            freq[byte] = freq.get(byte, 0) + 1
        entropy = 0.0
        n = len(data)
        for count in freq.values():
            p = count / n
            entropy -= p * math.log2(p)
        return entropy

    def compute_imphash(self, imports: List[str]) -> str:
        """
        Calcule l'Import Hash (ImpHash) : empreinte MD5 de la liste ordonnée et normalisée
        des fonctions importées. Permet le clustering de familles de malware sans exécution.
        """
        normalized = ",".join(sorted([f.lower() for f in imports]))
        return hashlib.md5(normalized.encode()).hexdigest()

    def analyze_imports(self, imported_functions: List[str]) -> dict:
        """Analyse l'IAT pour détecter les capacités malveillantes."""
        detected_capabilities = set()
        for func in imported_functions:
            if func in self.SUSPICIOUS_IMPORTS:
                cap = self.SUSPICIOUS_IMPORTS[func]
                detected_capabilities.add(cap)
                self.findings.append({
                    "type": "SUSPICIOUS_IMPORT",
                    "function": func,
                    "capability": cap,
                    "severity": "HIGH"
                })

        return {
            "imphash": self.compute_imphash(imported_functions),
            "detected_capabilities": list(detected_capabilities)
        }

    def extract_suspicious_strings(self, min_length: int = 6) -> List[str]:
        """Extrait les chaînes ASCII/UTF-16 suspectes (URLs C2, Clés Registry, Domaines)."""
        strings = []
        current = []
        for byte in self.raw:
            if 0x20 <= byte <= 0x7E:
                current.append(chr(byte))
            elif len(current) >= min_length:
                s = "".join(current)
                if any(kw in s.lower() for kw in ["http", "registry", "cmd.exe", "\\temp\\", "\.exe", "password"]):
                    strings.append(s)
                current = []
            else:
                current = []
        return strings

    def generate_static_report(self) -> dict:
        section_entropy = self.calculate_entropy(self.raw)
        is_packed = section_entropy > 7.0
        return {
            "sample_path": self.path,
            "sha256": hashlib.sha256(self.raw).hexdigest(),
            "section_entropy": round(section_entropy, 2),
            "is_likely_packed_or_encrypted": is_packed,
            "findings": self.findings
        }

# Démonstration d'Analyse Statique
malware_bytes = b"MZ\x90\x00" + b"\xce" * 200  # Simulation d'un binaire PE à haute entropie
sample = StaticMalwareAnalyzer("C:\\suspect\\malware_dropper.exe", malware_bytes)

print("=== STATIC PE MALWARE ANALYSIS ENGINE ===")

# 1. Analyse de l'IAT (Import Address Table)
iat_result = sample.analyze_imports([
    "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread",
    "CryptEncrypt", "IsDebuggerPresent", "RegSetValueExA"
])

# 2. Rapport Statique
report = sample.generate_static_report()
report["iat_analysis"] = iat_result

print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 3) Module — Rédaction de Règle YARA (2h)

```yara
// RÈGLE YARA — Détection de Ransomware via Patterns PE Statiques
rule Paradis_Ransomware_Static_Indicator
{
    meta:
        author = "PARADIS IT Threat Research Team"
        description = "Détecte un binaire ayant des imports de chiffrement + injection mémoire + anti-debug"
        date = "2026-08-10"
        mitre_att = "T1486 - Data Encrypted for Impact"
        severity = "CRITICAL"
    strings:
        // Import Strings de Chiffrement
        $crypt1 = "CryptEncrypt" ascii nocase
        $crypt2 = "BCryptEncrypt" ascii nocase
        // Import String d'Injection
        $inject1 = "VirtualAllocEx" ascii nocase
        $inject2 = "WriteProcessMemory" ascii nocase
        // Anti-Debug
        $antidebug = "IsDebuggerPresent" ascii nocase
        // Pattern d'extension de Ransom note
        $ransom_ext1 = ".paradisencrypted" ascii
        $ransom_ext2 = ".locked" ascii
    condition:
        uint16(0) == 0x5A4D and   // MZ Header
        2 of ($crypt*) and
        1 of ($inject*) and
        $antidebug and
        any of ($ransom_ext*)
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PE** | Portable Executable — Format de fichier binaire exécutable standard de Windows |
| **IAT** | Import Address Table — Table des fonctions API importées depuis des DLLs |
| **ImpHash** | Import Hash — Empreinte MD5 de la liste des imports normalisés, utilisée pour le clustering de malwares |
| **YARA** | Yet Another Ridiculous Acronym — Langage de règles de signature pour identifier et classer les malwares |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** La présence de la combinaison `VirtualAllocEx` + `WriteProcessMemory` + `CreateRemoteThread` dans la table d'importation (**IAT**) d'un binaire PE indique quelle capacité malveillante ?
- A) L'injection de code dans un processus cible légitime (Process Injection / Hollowing)
- B) La défragmentation du disque dur
- C) La mise à jour de Windows Defender
- D) La gestion des drivers graphiques

**Réponse : A**

**Q2 :** Une section PE avec une **entropie de Shannon supérieure à 7.0** signifie presque certainement que :
- A) Le binaire est compressé (packed) ou chiffré, ce qui est typique des malwares évadant les antivirus basés sur les signatures
- B) Le fichier est très volumineux
- C) Le programme est un jeu vidéo 3D
- D) Le binaire est signé par Microsoft

**Réponse : A**

**Q3 :** Quel est l'avantage de l'**Import Hash (ImpHash)** pour un analyste malware ?
- A) Permette de regrouper (cluster) des variantes d'une même famille de malware qui partagent la même IAT, même si leurs hash SHA-256 sont différents en raison de recompilations
- B) Il génère automatiquement un rapport PDF
- C) Il déchiffre le trafic TLS
- D) Il accélère la connexion réseau

**Réponse : A**

**Q4 :** Dans une règle YARA, que signifie la condition `uint16(0) == 0x5A4D` ?
- A) Que les 2 premiers octets du fichier correspondent au Magic Number `MZ` (0x4D5A en Little Endian), confirmant qu'il s'agit d'un exécutable Windows PE
- B) Que le fichier dépasse 100 Mo
- C) Que le fichier est chiffré en AES-256
- D) Que le hash SHA-256 est connu

**Réponse : A**

**Q5 :** Quel outil en ligne de commande Unix/Linux simple permet d'extraire les chaînes de caractères ASCII/Unicode lisibles depuis un binaire opaque ?
- A) `strings malware.exe`
- B) `chmod +x malware.exe`
- C) `cat malware.exe`
- D) `ping malware.exe`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
