# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 529 (6h) : Forensique Avancée & Réponse aux Incidents (DFIR) : Playbooks de Réponse, Volatility 3, Autopsy & Chaîne de Custodie

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les 6 étapes du cadre de réponse aux incidents de sécurité **SANS PICERL** (Préparation, Identification, Confinement, Éradication, Recouvrement, Leçons Apprises)
> - Réaliser une analyse forensique de la mémoire vive (RAM) avec **Volatility 3** pour isoler les injections de code
> - Respecter scrupuleusement la **Chaîne de Custodie (Chain of Custody)** et l’intégrité cryptographique des preuves numériques (Hashes SHA-256)
> - Analyser les artefacts disque (NTFS MFT, Registry, Prefetch) avec **Autopsy** et **The Sleuth Kit (TSK)**
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — Advanced Forensics & Incident Response Playbooks

---

## Module 1 — Le Cadre SANS PICERL & la Chaîne de Custodie (2h)

### 📖 Intuition & Narration

Lorsqu'une cyberattaque ou une fuite de données majeure se produit, les analystes de réponse aux incidents (DFIR — Digital Forensics & Incident Response) interviennent comme la police scientifique sur une scène de crime.

Une erreur fréquente lors des premières minutes d'un incident est d'éteindre brutalement le serveur compromis. Cette action efface définitivement la mémoire vive (RAM), où se trouvent pourtant les clés de chiffrement du ransomware, les processus malveillants injectés et les connexions réseau actives.

Le spécialiste DFIR suit une méthodologie stricte (**SANS PICERL**) et s'assure que chaque preuve numérique prélevée conserve sa valeur juridique grâce à la **Chaîne de Custodie (Chain of Custody)**.

### 🔍 Anatomie Technique — Les 6 Étapes SANS PICERL & Chaîne de Custodie

```
LE CADRE INCIDENT RESPONSE SANS PICERL

  1. PREPARATION     : Outillage, Playbooks, Accès d'urgence, Équipe d'astreinte.
  2. IDENTIFICATION  : Qualification de l'incident, portée de la compromission.
  3. CONTAINMENT     : Confinement court/long terme (Isolation réseau du système).
  4. ERADICATION     : Suppression des malwares, comptes compromis et portes dérobées.
  5. RECOVERY        : Restauration sécurisée des services (Verification & RTO).
  6. LESSONS LEARNED : Rapport post-mortem et amélioration des règles SIEM/EDR.

CHAÎNE DE CUSTODIE NUMÉRIQUE :
  • Saisie de la preuve ──► Calcul immédiat de l'empreinte SHA-256 du dump RAM/Image disque.
  • Enregistrement immuable (Qui a prélevé la preuve, quand, comment, stockée où).
```

---

## Module 2 — Atelier Pratique : Volatility 3 Memory Forensics Simulator (2h)

### 🛠️ Code Python : Volatility 3 Automated Memory Artifact Parser

```python
#!/usr/bin/env python3
"""
PARADIS — Volatility 3 Automated RAM Artifact Parser
Simule l'extraction et l'analyse d'artefacts mémoire RAM pour la détection de processus injectés.
"""

import json
import hashlib
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class RAMProcess:
    pid: int
    ppid: int
    name: str
    handles_count: int
    is_injected: bool
    path: str

class Volatility3Analyzer:
    def __init__(self, memory_dump_path: str):
        self.memory_dump_path = memory_dump_path
        self.dump_sha256 = ""

    def verify_image_integrity(self) -> str:
        """Calcule le hash SHA-256 du dump mémoire pour la chaîne de custodie."""
        print(f"=== ANCRAGE CRYPTOGRAPHIQUE CHAÎNE DE CUSTODIE (DFIR) ===")
        print(f"[*] Calcul de l'empreinte SHA-256 du dump RAM '{self.memory_dump_path}'...")
        # Simulation du hachage du fichier dump
        self.dump_sha256 = hashlib.sha256(self.memory_dump_path.encode()).hexdigest()
        print(f"[✅ INTEGRITE CERTIFIÉE] SHA-256 : {self.dump_sha256}")
        return self.dump_sha256

    def run_windows_pslist(self) -> List[RAMProcess]:
        """Simule la commande Volatility 3 : windows.pslist.PsList."""
        print("\n[*] Exécution du plugin Volatility 3 : windows.pslist...")
        processes = [
            RAMProcess(4, 0, "System", 1200, False, "C:\\Windows\\System32\\ntoskrnl.exe"),
            RAMProcess(452, 4, "smss.exe", 80, False, "C:\\Windows\\System32\\smss.exe"),
            RAMProcess(892, 452, "lsass.exe", 450, False, "C:\\Windows\\System32\\lsass.exe"),
            RAMProcess(3412, 892, "svchost.exe", 150, False, "C:\\Windows\\System32\\svchost.exe"),
            RAMProcess(6640, 3412, "powershell.exe", 320, True, "C:\\Users\\Victim\\AppData\\Local\\Temp\\malware.exe") # Injected process
        ]
        return processes

    def run_windows_malfind(self, processes: List[RAMProcess]) -> List[dict]:
        """Simule le plugin Volatility 3 : windows.malfind.Malfind (détection d'injections DLL/Code)."""
        print("[*] Exécution du plugin Volatility 3 : windows.malfind (Détection d'Injections)...")
        injections = []

        for p in processes:
            if p.is_injected:
                injections.append({
                    "pid": p.pid,
                    "process_name": p.name,
                    "path": p.path,
                    "protection": "PAGE_EXECUTE_READWRITE (RWX)",
                    "finding": "Zone mémoire exécutable suspecte détectée sans fichier sur disque (Process Injection)"
                })

        return injections

if __name__ == "__main__":
    memory_dump = "/forensics/evidence/dump_ram_server_2024.raw"
    analyzer = Volatility3Analyzer(memory_dump)

    # 1. Validation de l'intégrité de la preuve
    analyzer.verify_image_integrity()

    # 2. Extraction des processus
    procs = analyzer.run_windows_pslist()
    print(f"    Total processus identifiés en RAM : {len(procs)}")

    # 3. Détection des injections de code
    injected = analyzer.run_windows_malfind(procs)

    print("\n" + "═"*75)
    print("  RAPPORT D'ANALYSE ACCÉLÉRÉE VOLATILITY 3 (MEMOIRE RAM)")
    print("═"*75)
    for inj in injected:
        print(f"  🚨 [PROCESSUS INJECTÉ TROUVÉ] PID : {inj['pid']} | Nom : {inj['process_name']}")
        print(f"     Chemin exécutable : {inj['path']}")
        print(f"     Protection RAM    : {inj['protection']}")
        print(f"     Analyse           : {inj['finding']}\n")
    print("═"*75)
```

---

## Module 3 — Forensique Disque & Artefacts Windows/Linux (1h30)

### 🔍 Principaux Artefacts Forensiques Disque

En analyse disque (avec **Autopsy** ou **The Sleuth Kit**), l'analyste recherche des preuves de l'exécution et de la persistance de l'attaquant :

1. **Windows MFT ($Master File Table)** : Enregistre la création, la modification et la suppression de tous les fichiers (Timestamp $STANDARD_INFORMATION et $FILE_NAME pour détecter le Timestomping).
2. **Windows Prefetch (.pf)** : Prouve qu'un exécutable spécifique a été lancé sur la machine, avec la date de dernière exécution et le nombre de lancements.
3. **Linux Shimcache / Amcache** : Traçabilité des exécutables lancés sur le système.
4. **Logs Syslog / Journald** : Historique des sessions SSH et élévations de privilèges (`sudo`).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DFIR** | Digital Forensics and Incident Response — Forensique numérique et réponse aux incidents |
| **MFT** | Master File Table — Table de fichiers principale du système de fichiers NTFS |
| **RAM** | Random Access Memory — Mémoire vive de l'ordinateur |
| **RWX** | Read-Write-Execute — Protection mémoire permissive souvent utilisée par les malwares |

---

## Exercices Pratiques

### Exercice 1 — La Règle d'Or de l'Acquisition Mémoire

Pourquoi est-il impératif d'effectuer l'acquisition de la mémoire RAM **avant** la création d'une image forensique du disque dur lors de la réponse à un incident sur un serveur sous attaque ?

**Corrigé guidé :**
Parce que la mémoire RAM est une preuve hautement **volatile** (elle s'efface à l'extinction du serveur et évolue constamment à chaque seconde). De plus, l'exécution d'un outil de copie de disque modifie l'état de la RAM. L'acquisition RAM doit toujours être la première action d'investigation (Ordre de volatilité de RFC 3227).

---

## Banque QCM — 5 Questions

**Q1.** Dans le cadre de réponse aux incidents **SANS PICERL**, que signifie la lettre **C** ?

- A) Cryptographie.
- B) Containment (Confinement / Isolation de la menace). ✅
- C) Calculation.
- D) Certification.

**Q2.** Pourquoi est-il indispensable de calculer et de consigner l'empreinte **SHA-256** d'un dump mémoire RAM immédiatement après sa saisie ?

- A) Pour compresser le fichier.
- B) Pour garantir la Chaîne de Custodie (Chain of Custody) et prouver devant un tribunal que la preuve numérique n'a pas été altérée depuis sa collecte. ✅
- C) Pour supprimer les virus.
- D) Pour accélérer le scan.

**Q3.** Quel outil d'analyse forensique mémoire open-source de référence permet d'analyser les dumper RAM (plugins `pslist`, `malfind`, `netscan`) ?

- A) Volatility 3. ✅
- B) MS Paint.
- C) WinRAR.
- D) Wireshark.

**Q4.** Que révèle la présence d'une zone mémoire avec la permission **RWX (Read-Write-Execute)** lors de l'exécution du plugin `malfind` ?

- A) Que le processeur est surchauffé.
- B) Une très forte suspicion d'injection de code malveillant (Process Injection / Shellcode) en mémoire RAM sans fichier sur disque. ✅
- C) Une erreur de syntaxe HTML.
- D) Que la carte réseau est déconnectée.

**Q5.** Dans l'analyse forensique Windows, que prouve la présence d'un fichier **.pf (Prefetch)** dans le répertoire `C:\Windows\Prefetch` ?

- A) Que le fichier est une image PNG.
- B) Que l'application correspondante a été effectivement exécutée sur le système (avec horodatage et compteur de lancements). ✅
- C) Que l'ordinateur est neuf.
- D) Que l'utilisateur est administrateur.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
