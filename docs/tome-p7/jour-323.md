# TOME P7 — Certifications d'Élite & Spécialisations — Jour 323 (6h) : GREM Prep — Rootkit Detection (DKOM, SSDT Hooks, Volatility 3 Memory Analysis & Kernel-Level Artifact Recovery)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **détection avancée de rootkits Windows** ciblée par la certification **GREM** : comprendre les techniques **DKOM (Direct Kernel Object Manipulation)** pour masquer des processus, les **SSDT Hooks** pour intercepter les appels système, et conduire une **analyse mémoire forensique complète** avec **Volatility 3** pour détecter ces artefacts dans un dump mémoire d'un système compromis.
>
> **Compétences visées :** `GREM-05` (A) — DKOM & SSDT Rootkit Techniques | `GREM-06` (A) — Volatility 3 Memory Forensics & Hidden Process Detection

---

## 1) Module — Techniques de Rootkit Kernel-Level (2h)

### 📖 Narration/Intuition

Les **rootkits kernel-level (Ring 0)** opèrent au niveau du noyau Windows, au-dessous de tout antivirus userland. Ils utilisent des techniques avancées pour masquer leur présence :

| Technique | Mécanisme | Détection |
|:--------:|:----------|:--------:|
| **DKOM** | Manipule la liste doublement chaînée `EPROCESS` en décrochant le processus malveillant | Volatility `pstree` vs `pslist` divergence |
| **SSDT Hook** | Remplace les pointeurs de la System Service Descriptor Table vers des fonctions malveillantes | Volatility `ssdt` plugin |
| **DKOM Driver Hide** | Retire le driver malveillant de la liste `PsLoadedModuleList` | Volatility `modules` vs `driverscan` |
| **IRP Hook** | Modifie les I/O Request Packets du driver légitime pour filtrer les résultats | Analyse du MajorFunction array |

---

## 2) Module — Analyse Mémoire Volatility 3 (`volatility3_forensics.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# VOLATILITY 3 — Analyse d'un dump mémoire Windows infecté par un rootkit
# Scénario : Système Windows 10 compromis, dump = memory.raw (16GB)
# ═══════════════════════════════════════════════════════

DUMP="memory.raw"

# ─────────────────────────────────────────────────────
# 1) IDENTIFICATION DU PROFIL MÉMOIRE
# ─────────────────────────────────────────────────────
python3 vol.py -f $DUMP windows.info
# → Identifie l'OS, la version du noyau, le KDBG offset

# ─────────────────────────────────────────────────────
# 2) LISTE DES PROCESSUS — Détection DKOM
#    TECHNIQUE : Comparer pslist (liste EPROCESS) vs psscan (scan physique)
# ─────────────────────────────────────────────────────

echo "=== PROCESSUS VIA LISTE EPROCESS (pslist) ==="
python3 vol.py -f $DUMP windows.pslist
# → Liste les processus via la liste doublement chaînée ActiveProcessLinks

echo "=== PROCESSUS VIA SCAN PHYSIQUE (psscan) ==="
python3 vol.py -f $DUMP windows.psscan
# → Scanne physiquement la mémoire pour trouver les structures EPROCESS
# → Un processus présent dans psscan mais ABSENT de pslist = ROOTKIT DKOM !

# ─────────────────────────────────────────────────────
# 3) DÉTECTION SSDT HOOKS
# ─────────────────────────────────────────────────────
echo "=== SSDT HOOKS DÉTECTÉS ==="
python3 vol.py -f $DUMP windows.ssdt
# → Affiche les entrées SSDT hookées (pointeurs vers des modules non-kernel légitimes)
# → Ex: NtOpenProcess → MALWARE.SYS au lieu de ntoskrnl.exe = HOOK !

# ─────────────────────────────────────────────────────
# 4) MODULES KERNEL CACHÉS (DKOM Driver Hiding)
# ─────────────────────────────────────────────────────
echo "=== MODULES VIA PsLoadedModuleList ==="
python3 vol.py -f $DUMP windows.modules
# → Modules dans la liste officielle du kernel

echo "=== MODULES VIA SCAN PHYSIQUE ==="
python3 vol.py -f $DUMP windows.driverscan
# → Driver présent dans driverscan mais ABSENT de modules = ROOTKIT !

# ─────────────────────────────────────────────────────
# 5) RÉSEAU — Connexions actives et masquées
# ─────────────────────────────────────────────────────
python3 vol.py -f $DUMP windows.netstat
# → Connexions réseau résidantes en mémoire (y compris celles cachées à l'API userland)

# ─────────────────────────────────────────────────────
# 6) DUMP DU PROCESS MALVEILLANT pour analyse statique ultérieure
# ─────────────────────────────────────────────────────
MALICIOUS_PID=1337
python3 vol.py -f $DUMP windows.dumpfiles --pid $MALICIOUS_PID
# → Extrait les .exe et .dll du processus en mémoire pour analyse IDA/Ghidra
```

---

## 3) Module — Script d'Analyse Différentielle DKOM (`dkom_detector.py`) (2h)

```python
import subprocess
import json

def detect_dkom_hidden_processes(dump_path: str) -> list:
    """
    Détecte les processus masqués par DKOM en comparant
    les résultats de pslist (liste EPROCESS) et psscan (scan physique).
    Un processus présent dans psscan mais absent de pslist = caché par DKOM.
    """
    print(f"=== DKOM HIDDEN PROCESS DETECTOR — {dump_path} ===\n")

    def run_vol_plugin(plugin: str) -> set:
        """Exécute un plugin Volatility 3 et retourne l'ensemble des PIDs."""
        result = subprocess.run(
            ["python3", "vol.py", "-f", dump_path, plugin, "--output=json"],
            capture_output=True, text=True
        )
        pids = set()
        try:
            data = json.loads(result.stdout)
            for row in data.get("rows", []):
                # PID est en colonne 1 (0-indexed)
                pids.add(row[1])
        except json.JSONDecodeError:
            pass
        return pids

    pslist_pids = run_vol_plugin("windows.pslist")
    psscan_pids = run_vol_plugin("windows.psscan")

    hidden_pids = psscan_pids - pslist_pids

    if hidden_pids:
        print(f"[!] ALERTE DKOM — {len(hidden_pids)} processus cachés détectés !")
        for pid in hidden_pids:
            print(f"    PID {pid} — PRÉSENT dans psscan, ABSENT de pslist → DKOM ROOTKIT !")
    else:
        print("[✓] Aucun processus caché par DKOM détecté")

    return list(hidden_pids)

# detect_dkom_hidden_processes("memory.raw")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DKOM** | Direct Kernel Object Manipulation — Technique rootkit manipulant les structures du noyau Windows |
| **SSDT** | System Service Descriptor Table — Table Windows listant les pointeurs des appels système kernel |
| **Volatility** | Framework open-source d'analyse forensique de la mémoire vive (RAM dumps) |
| **EPROCESS** | Structure noyau Windows décrivant un processus (membre de la liste doublement chaînée des processus) |
| **IRP** | I/O Request Packet — Mécanisme de communication entre le noyau et les drivers Windows |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Comment un **rootkit DKOM** masque-t-il un processus des outils de listing comme `tasklist.exe` ou le Gestionnaire des Tâches ?
- A) En décrochant la structure EPROCESS du processus malveillant de la liste doublement chaînée `ActiveProcessLinks`, la rendant invisible aux API Windows qui parcourent cette liste
- B) En chiffrant le processus en mémoire
- C) En modifiant le fichier `C:\Windows\System32\tasklist.exe`
- D) En utilisant une DLL injection sur explorer.exe

**Réponse : A**

**Q2 :** Dans Volatility 3, quelle paire de plugins permet de détecter les processus cachés par DKOM ?
- A) `windows.pslist` (parcourt la liste EPROCESS) comparé à `windows.psscan` (scan physique de la RAM) — tout processus dans psscan mais absent de pslist est caché
- B) `windows.malfind` vs `windows.cmdline`
- C) `windows.netstat` vs `windows.connections`
- D) `windows.dlllist` vs `windows.driverscan`

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **SSDT Hook** dans le contexte des rootkits Windows ?
- A) La modification des pointeurs de la System Service Descriptor Table pour rediriger les appels système légitimes (ex: NtOpenProcess) vers des fonctions malveillantes du rootkit, filtrant ainsi les résultats
- B) L'injection d'un DLL dans lsass.exe
- C) La modification du Master Boot Record
- D) Le chiffrement de la mémoire du processus système

**Réponse : A**

**Q4 :** Pourquoi utiliser `windows.driverscan` en plus de `windows.modules` dans Volatility lors d'une investigation rootkit ?
- A) Car un rootkit peut retirer son driver de la `PsLoadedModuleList` (liste officielle visible dans `windows.modules`), mais le driver reste physiquement en mémoire et est détectable par le scan brut `driverscan`
- B) Car `windows.modules` ne fonctionne que sur Windows 7
- C) Car `windows.driverscan` est plus rapide
- D) Car les deux plugins font la même chose

**Réponse : A**

**Q5 :** Quel plugin Volatility 3 permet d'extraire le binaire exécutable d'un processus directement depuis un dump mémoire pour analyse statique ultérieure dans IDA Pro ?
- A) `windows.dumpfiles --pid <PID>` — Extrait les sections PE du processus (exe + dlls mappées) depuis la mémoire
- B) `windows.pslist --dump`
- C) `windows.malfind --extract`
- D) `windows.modules --dump`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
