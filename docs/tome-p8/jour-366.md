# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 366 (6h) : Live Response & Fast Forensic Triage (KAPE, Velociraptor, CyLR & Live Memory/Artifact Acquisition)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **Live Response et Triage Forensique Rapide** lors d'une cyberattaque majeure : déployer et automatiser **KAPE (Kroll Artifact Parser and Extractor)** et **Velociraptor**, orchestrer la collecte à chaud des artefacts volatils (RAM, MFT, Registry Hives, Event Logs, Prefetch), et préserver la chaîne de traçabilité des preuves numériques (**Chain of Custody** / RFC 3227).
>
> **Compétences visées :** `DFIR-TRIAGE-01` (A) — Live Response & Fast Forensic Triage | `DFIR-TRIAGE-02` (A) — Velociraptor / KAPE Artifact Collection & Chain of Custody Management

---

## 1) Module — Principes de Live Response & Ordre de Volatilité (2h)

### 📖 Narration/Intuition

Lors d'un incident de sécurité (ex. Ransomware ou intrusion APT), les enquêteurs DFIR ne peuvent pas attendre plusieurs heures pour faire une image disque complète de 2 To. La **Live Response (Triage Rapide)** consiste à collecter en quelques minutes **uniquement les 1% d'artefacts critiques** qui fournissent 95% des réponses sur l'incident.

```
       ┌─────────────────────────────────────────────────────────────┐
       │              ORDRE DE VOLATILITÉ (RFC 3227)                 │
       │                                                             │
       │  1. Mémoire RAM / Registres CPU  ──► Extrêmement Volatils    │
       │  2. Cache ARP, Table de Routage ──► Très Volatils           │
       │  3. Connexions Réseau Actives    ──► Volatilité Moyenne     │
       │  4. Artefacts Système (MFT, Registry) ──► Faible Volatilité │
       │  5. Disque Dur / Backups S3      ──► Non Volatils           │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ (Collecte via Velociraptor / KAPE)
                                      ▼
             [ VIRTUAL FORENSIC TARGET CONTAINER (.VHDX / .ZIP) ]
```

#### Comparatif des Outils de Triage Forensique Rapide

| Outil | Mode d'Exécution | Artefacts Cibles | Usage Privilégié |
|:---:|:---|:---|:---|
| **Velociraptor** | Agent / Service / Standalone | VQL Queries, Memory, MFT, Event Logs | Collecte d'entreprise à l'échelle (1000+ hôtes) |
| **KAPE** | Binaire portable (CLI / GUI) | Targets (.tkape) & Parsers (.gkape) | Triage ultra-rapide poste par poste |
| **CyLR** | Binaire Go multi-plateforme | Raw Disk Artifacts | Collecte minimale d'urgence |
| **FTK Imager** | Application Windows | Raw Image DD / E01 | Image disque bit-à-bit (Dead Forensics) |

---

## 2) Module — Outillage Fast Triage & Evidence Chain Engine (`fast_triage_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class FastTriageEngine:
    """
    Moteur de simulation et de vérification d'intégrité pour le Triage Forensique Rapide (RFC 3227).
    Gère la collecte d'artefacts volatiles et garantit la Chain of Custody via calcul de hashes SHA-256.
    """

    def __init__(self, case_id: str, lead_investigator: str):
        self.case_id = case_id
        self.investigator = lead_investigator
        self.collected_artifacts: List[dict] = []
        self.evidence_chain: List[dict] = []

    def _calculate_sha256(self, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def collect_volatile_artifact(self, artifact_name: str, category: str, raw_content: bytes, source_path: str) -> dict:
        """
        Collecte un artefact volatil (ex. MFT, Registry, Prefetch), calcule son empreinte SHA-256
        et l'enregistre dans le conteneur de preuve.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        content_hash = self._calculate_sha256(raw_content)
        
        artifact_entry = {
            "artifact_id": f"ART-{len(self.collected_artifacts)+1:03d}",
            "name": artifact_name,
            "category": category,
            "source_path": source_path,
            "size_bytes": len(raw_content),
            "sha256": content_hash,
            "collected_at": timestamp
        }
        self.collected_artifacts.append(artifact_entry)

        # Enregistrement dans la Chaîne de Traçabilité (Chain of Custody)
        custody_entry = {
            "timestamp": timestamp,
            "case_id": self.case_id,
            "artifact_id": artifact_entry["artifact_id"],
            "action": "COLLECTED_AND_HASHED",
            "handler": self.investigator,
            "sha256_verifiable": content_hash
        }
        self.evidence_chain.append(custody_entry)
        
        print(f"[{timestamp}] [DFIR-TRIAGE] Collecté: {artifact_name} ({category}) -> SHA256: {content_hash[:16]}...")
        return artifact_entry

    def generate_case_triage_manifest(self) -> dict:
        """Génère le manifeste de preuve signé pour archivage légal."""
        manifest_data = json.dumps(self.collected_artifacts, sort_keys=True).encode()
        master_hash = self._calculate_sha256(manifest_data)
        
        return {
            "case_id": self.case_id,
            "lead_investigator": self.investigator,
            "total_artifacts": len(self.collected_artifacts),
            "master_manifest_sha256": master_hash,
            "artifacts_summary": self.collected_artifacts,
            "chain_of_custody_log": self.evidence_chain
        }

# Démonstration de Triage Rapide
triage = FastTriageEngine("CASE-2026-INC88", "Investigateur_DFIR_Lead")

print("=== FAST FORENSIC TRIAGE & CHAIN OF CUSTODY ENGINE ===")

# Simulation de collecte d'artefacts volatiles critiques (Order of Volatility)
triage.collect_volatile_artifact(
    artifact_name="RAM_Dump_Head.raw",
    category="MEMORY",
    raw_content=b"VRMEM_DUMP_HEADER_MOCK_BYTES_99812",
    source_path="\\\\.\\PhysicalMemory"
)

triage.collect_volatile_artifact(
    artifact_name="SYSTEM_Registry_Hive",
    category="REGISTRY",
    raw_content=b"regf_SYSTEM_HIVE_MOCK_DATA_12345",
    source_path="C:\\Windows\\System32\\config\\SYSTEM"
)

triage.collect_volatile_artifact(
    artifact_name="$MFT_MasterFileTable",
    category="FILE_SYSTEM",
    raw_content=b"FILE0_MFT_ENTRY_MOCK_BYTES_554433",
    source_path="C:\\$MFT"
)

print("\n=== MANIFESTE FORENSIQUE DE L'INCIDENT ===")
print(json.dumps(triage.generate_case_triage_manifest(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Configuration Velociraptor VQL (2h)

```sql
-- REQUÊTE VELOCIRAPTOR VQL (VELOCIRAPTOR QUERY LANGUAGE)
-- Collecte automatique des artefacts de triage KAPE sur un hôte suspect

SELECT * FROM Artifact.Windows.KapeFiles.Targets(
    KapeTriage=TRUE,
    SearchTargetDirectory="C:\\"
)

-- Analyse VQL des connexions réseau actives et des processus associés
SELECT Pid, Name, CommandLine, Laddr.IP AS LocalIP, Laddr.Port AS LocalPort, Raddr.IP AS RemoteIP, Raddr.Port AS RemotePort
FROM netstat()
WHERE RemoteIP AND NOT RemoteIP =~ "^(127\\.|10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.)"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KAPE** | Kroll Artifact Parser and Extractor — Outil de triage forensique haute vitesse |
| **VQL** | Velociraptor Query Language — Langage de requête puissant pour l'investigation et la traque sur les endpoints |
| **Chain of Custody** | Chaîne de traçabilité documentant l'historique de possession et d'intégrité d'une preuve numérique |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Selon la RFC 3227, quel est l'élément le plus volatil à collecter **en premier** lors d'une intervention de Live Response ?
- A) La mémoire vive (RAM) et les registres processeur
- B) Le disque dur externe
- C) Les sauvegardes sur bandes magnétiques
- D) Le manuel d'utilisation de l'ordinateur

**Réponse : A**

**Q2 :** Pourquoi la vérification du hash **SHA-256** de chaque artefact collecté est-elle obligatoire dans la Chaîne de Traçabilité (**Chain of Custody**) ?
- A) Pour prouver cryptographiquement devant une cour de justice ou des experts que la preuve numérique n'a pas été modifiée ou altérée depuis sa collecte
- B) Pour réduire la taille du fichier
- C) Pour accélérer la vitesse d'analyse
- D) C'est une recommandation optionnelle sans valeur juridique

**Réponse : A**

**Q3 :** Quelle est la différence majeure entre **KAPE** et une image disque forensique bit-à-bit traditionnelle (FTK Imager / `dd`) ?
- A) KAPE ne cible et n'extrait que les artefacts système pertinents en quelques minutes (Triage), alors qu'une image bit-à-bit copie l'intégralité du disque dur secteur par secteur (Dead Forensics)
- B) KAPE ne fonctionne qu'en Wi-Fi
- C) KAPE détruit le disque dur
- D) Il n'y a aucune différence

**Réponse : A**

**Q4 :** Quel est le langage de requête utilisé par l'agent **Velociraptor** pour effectuer la traque et la collecte d'artefacts sur des milliers d'hôtes en simultané ?
- A) VQL (Velociraptor Query Language)
- B) SQL Server
- C) HTML5
- D) Python 2.7

**Réponse : A**

**Q5 :** Dans le contexte du Fast Triage, qu me permet l'analyse du fichier **`$MFT` (Master File Table)** ?
- A) Reconstituer l'arborescence complète des fichiers du système de fichiers NTFS, y compris les timestamps d'accès, de création et les fichiers supprimés
- B) Formater la carte graphique
- C) Gérer les adresses IP du routeur
- D) Imprimer les documents en PDF

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
