# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 368 (6h) : Windows Registry & User Activity Forensics (NTUSER.DAT, SYSTEM, SAM, Amcache & Shimcache Execution Proofs)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse forensique des ruches du **Registre Windows (Registry Forensics)** et de la reconstitution des activités utilisateurs : disséquer les ruches **SYSTEM**, **SOFTWARE**, **SAM** et **NTUSER.DAT**, extraire les preuves d'exécution de programmes via **Amcache.hve**, **Shimcache (AppCompatCache)**, **UserAssist**, et **Shellbags**, et identifier la persistance et l'exfiltration de données.
>
> **Compétences visées :** `DFIR-REG-01` (A) — Windows Registry Hives Dissection (SYSTEM, SAM, NTUSER.DAT) | `DFIR-REG-02` (A) — Program Execution Proofs (Shimcache, Amcache, UserAssist) & Shellbags Navigation Tracking

---

## 1) Module — Cartographie des Ruches du Registre & Artefacts d'Exécution (2h)

### 📖 Narration/Intuition

Le Registre Windows est la base de données centrale du système d'exploitation. Pour l'enquêteur DFIR, il fournit deux types de preuves fondamentales : les **configurations de persistance** et les **preuves d'exécution de programmes**.

```
                           ┌─────────────────────────────────────────┐
                           │          REGISTRE WINDOWS (HIVES)       │
                           └────────────────────┬────────────────────┘
                                                │
         ┌──────────────────────┬───────────────┴──────┬──────────────────────┐
         ▼                      ▼                      ▼                      ▼
  [ NTUSER.DAT / USRCLASS ]  [ SYSTEM Hive ]        [ SOFTWARE Hive ]      [ Amcache.hve ]
  - UserAssist (Exécutions)  - Shimcache (Execution)- Run keys / Persistence- SHA1 des binaires
  - Shellbags (Dossiers)     - USB Services         - Applications installées- First execution date
  - MRU (Fichiers récents)   - ComputerName / Timezone
```

#### Artefacts de Preuve d'Exécution (Program Execution Proofs)

| Artefact | Ruche / Fichier | Information Fournie | Niveau de Preuve |
|:---:|:---|:---|:---:|
| **UserAssist** | `NTUSER.DAT` (ROT13) | Nombre d'exécutions via l'IHM GUI, date du dernier lancement | **Exécution Confirmée** |
| **Shimcache** | `SYSTEM` (AppCompatCache) | Liste des binaires exécutés ou présents sur le système, taille, horodatage | **Présence / Exécution** |
| **Amcache** | `C:\Windows\AppCompat\Programs\Amcache.hve` | Chemin binaire complet, SHA1, date de compilation et de première exécution | **Identification Malware** |
| **Shellbags** | `NTUSER.DAT` / `USRCLASS.DAT` | Historique de navigation dans l'Explorateur de fichiers (dossiers ouverts) | **Recherche de Fichiers** |

---

## 2) Module — Outillage Registry Parser & Execution Proof Engine (`registry_forensics_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import codecs
from datetime import datetime, timezone
from typing import Dict, List

class RegistryForensicsEngine:
    """
    Moteur de parsing et d'analyse forensique du Registre Windows.
    Décode les valeurs UserAssist (ROT13), Shimcache et clés Run de persistance.
    """

    def __init__(self, hive_name: str):
        self.hive_name = hive_name
        self.execution_proofs: List[dict] = []
        self.persistence_keys: List[dict] = []

    @staticmethod
    def decode_userassist_rot13(encoded_string: str) -> str:
        """Décode la chaîne obfusquée ROT13 utilisée dans la clé UserAssist."""
        return codecs.decode(encoded_string, 'rot_13')

    def inspect_userassist_entry(self, encoded_guid_path: str, run_count: int, last_execution_epoch: float) -> dict:
        """Parse une entrée de la clé UserAssist du registre NTUSER.DAT."""
        decoded_path = self.decode_userassist_rot13(encoded_guid_path)
        last_exec_utc = datetime.fromtimestamp(last_execution_epoch, tz=timezone.utc).isoformat()

        proof = {
            "artifact": "USERASSIST",
            "decoded_executable_path": decoded_path,
            "run_count": run_count,
            "last_execution_utc": last_exec_utc
        }
        self.execution_proofs.append(proof)
        print(f"[!] PREUVE D'EXÉCUTION USERASSIST -> {decoded_path} (Exécuté {run_count} fois | Dernier: {last_exec_utc})")
        return proof

    def inspect_persistence_run_key(self, key_path: str, value_name: str, payload_cmd: str) -> dict:
        """Inspecte les clés Run / RunOnce pour repérer la persistance d'un malware."""
        is_suspicious = any(kw in payload_cmd.lower() for kw in ["cmd.exe", "powershell", "appdata", "temp", "wscript"])
        
        entry = {
            "key_path": key_path,
            "value_name": value_name,
            "payload_command": payload_cmd,
            "is_suspicious": is_suspicious
        }
        self.persistence_keys.append(entry)

        if is_suspicious:
            print(f"[!] PERSISTANCE SUSPECTE DANS LE REGISTRE [{key_path}] -> {value_name} = {payload_cmd}")

        return entry

# Démonstration Forensique Registre
engine = RegistryForensicsEngine("NTUSER.DAT")

print("=== WINDOWS REGISTRY FORENSICS & USER ACTIVITY ENGINE ===")

# Test 1 : Décodage d'une clé UserAssist obfusquée (ROT13)
# Chaine ROT13 simulée pour "C:\Users\Public\mimikatz.exe"
rot13_mimikatz = "P:\\Hserf\\Choyvp\\zvzvxngm.rkr"
engine.inspect_userassist_entry(rot13_mimikatz, run_count=5, last_execution_epoch=1723140000.0)

# Test 2 : Inspection d'une clé de persistance HKLM Run
engine.inspect_persistence_run_key(
    key_path="HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
    value_name="SecurityUpdateCheck",
    payload_cmd="powershell.exe -Enc SQBFAFgA..."
)

print("\n=== SUMMARY OF REGISTRY EXECUTION PROOFS ===")
print(json.dumps(engine.execution_proofs, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Localisation des Ruches et Clefs Critiques (2h)

```markdown
# EMPLACEMENT DES RUCHES ET CLEFS DE REGISTRE CRITIQUES

## 1. Fichiers Physique des Ruches (Hives)
- **SYSTEM / SOFTWARE / SAM / SECURITY :** `C:\Windows\System32\config\`
- **NTUSER.DAT :** `C:\Users\<Username>\NTUSER.DAT`
- **USRCLASS.DAT :** `C:\Users\<Username>\AppData\Local\Microsoft\Windows\USRCLASS.DAT`
- **Amcache :** `C:\Windows\AppCompat\Programs\Amcache.hve`

## 2. Clés de Persistance Majeures à Surveiller
- `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- `HKLM\SYSTEM\CurrentControlSet\Services\` (Services Système)
- `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell` (Remplacement d'explorer.exe)

## 3. Clés d'Activité Utilisateur & Périphériques USB
- **Périphériques USB branchés :** `HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR`
- **UserAssist (ROT13) :** `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist\`
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Hive** | Fichier binaire structuré stockant une branche spécifique du Registre Windows |
| **Shimcache** | AppCompatCache — Composant Windows conservant l'historique d'exécution et de compatibilité des binaires |
| **Amcache** | Base de données de registre répertoriant les programmes exécutés, leurs hashes SHA1 et leurs compilations |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la clé du registre **UserAssist** utilise-t-elle le chiffrement **ROT13** sur les chemins d'exécutables ?
- A) Par choix de conception historique de Microsoft pour obfusquer légèrement la liste des programmes lancés via l'IHM Windows (facilement décodable en inversant l'alphabet de 13 positions)
- B) Pour chiffrer la clé avec AES-256
- C) Pour bloquer les virus
- D) C'est un bug informatique

**Réponse : A**

**Q2 :** Quel artefact du registre conservé dans `Amcache.hve` est particulièrement précieux pour l'analyste DFIR ?
- A) Le chemin complet de l'exécutable, sa date de première exécution et son empreinte cryptographique **SHA1**, permettant d'identifier un malware même s'il a été renommé ou supprimé du disque
- B) La vitesse du ventilateur du processeur
- C) La couleur du thème Windows
- D) La liste des favoris Internet

**Réponse : A**

**Q3 :** Quelle ruche du registre contient les informations sur les périphériques de stockage USB précédemment connectés au système (`USBSTOR`) ?
- A) La ruche `SYSTEM` (`HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR`)
- B) La ruche `SAM`
- C) Le fichier `pagefile.sys`
- D) Le fichier `boot.ini`

**Réponse : A**

**Q4 :** Que révèlent les artefacts **Shellbags** lors de l'investigation du compte d'un utilisateur ?
- A) L'historique des dossiers et répertoires parcourus et consultés par l'utilisateur dans l'Explorateur Windows (y compris les dossiers sur clés USB déconnectées ou partages réseau)
- B) La liste des mails envoyés
- C) Le mot de passe du BIOS
- D) La clé de licence Windows

**Réponse : A**

**Q5 :** Dans quelle clé de registre un malware s'inscrit-il fréquemment pour s'exécuter automatiquement à chaque ouverture de session utilisateur ?
- A) `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- B) `HKLM\SYSTEM\CurrentControlSet\Control\CrashControl`
- C) `HKLM\HARDWARE\DESCRIPTION\System`
- D) `HKCU\Control Panel\Desktop`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
