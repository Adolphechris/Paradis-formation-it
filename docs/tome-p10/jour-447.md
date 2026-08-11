# TOME P10 — DFIR & Reverse Engineering — Jour 447 (6h) : Analyse Dynamique de Malwares (GDB, x64dbg, Sandbox Cuckoo & Behavioral Analysis)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le **debugging dynamique** de binaires suspects avec **GDB** (Linux) et **x64dbg** (Windows)
> - Configurer et exploiter une **sandbox Cuckoo 3** pour l'analyse comportementale automatisée de malwares
> - Intercepter les **API calls Windows** critiques avec des outils de monitoring (Process Monitor, API Monitor, Frida)
> - Comprendre les techniques d'**anti-debugging et anti-sandbox** et les techniques pour les contourner
>
> **Compétences visées :** `SEC-06` (A) — Dynamic Malware Analysis, `SEC-05` (A) — Behavioral Analysis

---

## Module 1 — GDB & x64dbg : Debug Dynamique d'un Binaire (2h)

### 📖 Intuition & Narration

L'analyse statique lit le manuel d'un programme. L'analyse **dynamique** l'observe pendant qu'il s'exécute. C'est la différence entre lire la partition d'une symphonie et l'entendre jouée : certains nuances ne s'expriment qu'à l'exécution. Pour un malware, cela signifie observer le déchiffrement de la charge utile, la résolution d'API, les connexions réseau — tout ce que l'obfuscation statique dissimulait.

### 🔍 Anatomie Technique — GDB (GNU Debugger) pour RE

```bash
# ══════════════════════════════════════════════════════
# GDB — Debugging dynamique Linux x86-64
# ══════════════════════════════════════════════════════

# Lancer GDB sur un binaire suspect (dans un environnement isolé!)
gdb ./suspect_binary

# ── COMMANDES GDB FONDAMENTALES ──────────────────────
(gdb) info functions         # Lister toutes les fonctions détectées
(gdb) disassemble main       # Désassembler la fonction main
(gdb) break *0x401234        # Breakpoint sur une adresse spécifique
(gdb) break decrypt_payload  # Breakpoint sur une fonction nommée
(gdb) run                    # Lancer l'exécution
(gdb) continue               # Reprendre après un breakpoint
(gdb) next                   # Exécuter la prochaine instruction (sans entrer dans les appels)
(gdb) step                   # Entrer dans l'appel de fonction suivant
(gdb) nexti                  # Prochaine instruction assembleur (niveau bas)

# ── INSPECTION DES REGISTRES & MÉMOIRE ───────────────
(gdb) info registers         # Afficher tous les registres
(gdb) print $rax             # Valeur du registre rax
(gdb) x/20xb $rsp            # Afficher 20 bytes en hex depuis rsp
(gdb) x/10gx $rdi            # Afficher 10 quadwords depuis rdi
(gdb) x/s $rdi               # Afficher comme chaîne (string)
(gdb) x/i $rip               # Afficher l'instruction courante

# ── TECHNIQUES RE AVANCÉES ────────────────────────────
# Définir un breakpoint conditionnel : s'arrêter si rax == 0
(gdb) break decrypt_payload if $rax == 0

# Capturer la valeur d'un registre à chaque appel
(gdb) commands 1
(gdb) > silent
(gdb) > printf "Key bytes: %02x %02x %02x %02x\n", $al, $bl, $cl, $dl
(gdb) > continue
(gdb) > end

# Modifier un registre/la mémoire en cours d'exécution (patch)
(gdb) set $rax = 1           # Forcer la valeur de rax
(gdb) set {int}0x6020a0 = 42 # Écrire 42 à l'adresse 0x6020a0

# Dump mémoire vers fichier (ex: payload déchiffré)
(gdb) dump binary memory /tmp/decrypted.bin 0x6020a0 0x602aa0
```

### 🔍 Anatomie Technique — Techniques Anti-Debugging

```
TECHNIQUES ANTI-DEBUGGING — DÉTECTION & CONTOURNEMENT

  1. IsDebuggerPresent() (Windows API)
     ├── Détection : Lit le flag IsDebugged dans le PEB
     ├── Contournement GDB/x64dbg : Patcher la valeur PEB en mémoire
     └── Patch : mov byte ptr [<PEB>+2], 0  ; mettre IsDebugged à 0

  2. Timing Checks (RDTSC)
     ├── Détection : Mesure le temps entre deux RDTSC — trop long = debugger
     ├── Code : rdtsc; [operations]; rdtsc; sub → delta > threshold → exit
     └── Contournement : NOP les RDTSC + CPUID de détection

  3. TLS Callbacks (Thread Local Storage)
     ├── Exécutés AVANT main() — invisibles si on place BP sur main
     └── Contournement : Détecter dans Ghidra section .tls, BP sur entry

  4. Exception-based Anti-Debugging (SEH/VEH)
     ├── Le malware déclenche une exception intentionnelle
     ├── Sous un debugger, le debugger la catchent en premier
     └── Contournement : Configurer debugger pour passer les exceptions

  5. Heap Flags Check
     ├── Sous Windows, les flags du heap changent en présence d'un debugger
     ├── Détection : NtQueryInformationProcess(ProcessDebugPort)
     └── Contournement : Patch NtQueryInformationProcess à renvoyer 0

  6. Sandbox Detection
     ├── CPU cores < 4, RAM < 4GB, pas de vrais fichiers utilisateur
     ├── Absence de logiciels utilisateur courants (Office, Chrome)
     └── Contournement sandbox : Configurer Cuckoo avec fake artifacts
```

---

## Module 2 — Cuckoo Sandbox 3 : Analyse Comportementale Automatisée (2h)

### 📖 Intuition & Narration

Analyser manuellement chaque malware est impossible à l'échelle — un SOC peut recevoir des dizaines de fichiers suspects par jour. **Cuckoo Sandbox** automatise l'analyse comportementale : il exécute le malware dans un environnement contrôlé et instrumenté, capture tous ses comportements (fichiers créés, clés de registre modifiées, connexions réseau, processus lancés), et génère un rapport détaillé.

### 🔍 Anatomie Technique — Architecture Cuckoo 3

```
ARCHITECTURE CUCKOO SANDBOX 3

  ┌─────────────────────────────────────────────────────────────┐
  │                   HOST (Serveur Cuckoo)                     │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
  │  │  REST API    │  │  Web UI      │  │  Scheduler       │  │
  │  │  :8090       │  │  :8000       │  │  (task queue)    │  │
  │  └──────────────┘  └──────────────┘  └──────────────────┘  │
  └────────────────────────────┬────────────────────────────────┘
                               │ Network (Host-Only)
  ┌────────────────────────────▼────────────────────────────────┐
  │                   GUEST VM (Windows 10)                     │
  │  ┌────────────────────────────────────────────────────────┐ │
  │  │  Cuckoo Agent (agent.py) — Port 8000                   │ │
  │  │  ✅ Moniteur de syscalls Windows                       │ │
  │  │  ✅ Hook API (Detours-like)                            │ │
  │  │  ✅ Capture réseau (tcpdump/Zeek)                      │ │
  │  │  ✅ Screenshots & vidéo comportement                   │ │
  │  └────────────────────────────────────────────────────────┘ │
  └─────────────────────────────────────────────────────────────┘

RAPPORT CUCKOO — SECTIONS CLÉS :
  behavior.processes    → Arbre des processus créés
  behavior.files        → Fichiers créés/modifiés/supprimés
  behavior.registry     → Clés de registre modifiées
  behavior.network      → Connexions TCP/UDP, DNS, HTTP
  signatures            → YARA rules matchées, behavioral detections
  malscore              → Score de malveillance 0-10
```

### 🛠️ Atelier Pratique — Déploiement Cuckoo 3

```bash
# ══════════════════════════════════════════════════════
# INSTALLATION CUCKOO SANDBOX 3 (Ubuntu 22.04 Host)
# ══════════════════════════════════════════════════════

# Prérequis système
apt-get install -y python3-pip python3-dev libssl-dev \
    postgresql libpq-dev tcpdump apparmor-utils \
    virtualbox  # Ou KVM/QEMU

# Créer un utilisateur dédié cuckoo (NE PAS exécuter en root)
adduser cuckoo
usermod -aG vboxusers,pcap cuckoo
su - cuckoo

# Installation Cuckoo Community (fork maintenu)
pip3 install cuckoo-community
cuckoo init

# Configuration réseau (interface réseau virtuelle pour les VMs)
sudo iptables -t nat -A POSTROUTING -o eth0 -s 192.168.56.0/24 -j MASQUERADE
sudo iptables -A FORWARD -s 192.168.56.0/24 -j ACCEPT
sudo iptables -A FORWARD -d 192.168.56.0/24 -j ACCEPT

# Démarrage du service
cuckoo -d &      # Daemon principal
cuckoo web &     # Interface web :8000

# ── SOUMETTRE UN SAMPLE ───────────────────────────────
# Via CLI
cuckoo submit /tmp/suspicious_invoice.doc
cuckoo submit --timeout 120 /tmp/malware.exe

# Via API REST
curl -F "file=@/tmp/malware.exe" \
     -F "timeout=120" \
     -F "options=free=yes" \
     http://localhost:8090/tasks/create/file

# ── RÉCUPÉRER LE RAPPORT ──────────────────────────────
TASK_ID=42
curl http://localhost:8090/tasks/report/$TASK_ID > report.json
jq '.info.score, .signatures[].name' report.json
```

---

## Module 3 — Frida : Dynamic Instrumentation & API Hooking (1h30)

### 📖 Intuition & Narration

**Frida** est un framework d'instrumentation dynamique qui permet d'injecter du JavaScript dans un processus en cours d'exécution pour intercepter et modifier ses appels de fonctions. C'est l'outil idéal pour contourner le chiffrement d'un malware : au lieu de déobfusquer statiquement, on laisse le malware se déchiffrer lui-même, puis on intercepte les données en clair au moment de leur utilisation.

### 🛠️ Atelier Pratique — Frida pour l'Analyse de Malware

```python
# ══════════════════════════════════════════════════════
# FRIDA — Hooking dynamique de fonctions Windows
# Script Python pour intercepter les API calls suspects
# ══════════════════════════════════════════════════════

import frida
import sys
import json

# Script Frida (JavaScript) injecté dans le processus cible
FRIDA_SCRIPT = """
// Intercepter CreateProcess (T1059 — Command Execution)
var CreateProcessW = Module.findExportByName("kernel32.dll", "CreateProcessW");
if (CreateProcessW) {
    Interceptor.attach(CreateProcessW, {
        onEnter: function(args) {
            var cmdline = args[1].readUtf16String();
            if (cmdline) {
                send({type: "CreateProcessW", cmdline: cmdline});
            }
        }
    });
}

// Intercepter InternetConnectA (C2 Communication)
var InternetConnect = Module.findExportByName("wininet.dll", "InternetConnectA");
if (InternetConnect) {
    Interceptor.attach(InternetConnect, {
        onEnter: function(args) {
            var host = args[1].readAnsiString();
            var port = args[2].toInt32();
            send({type: "InternetConnect", host: host, port: port});
        }
    });
}

// Intercepter CryptDecrypt (Déchiffrement de payload)
var CryptDecrypt = Module.findExportByName("advapi32.dll", "CryptDecrypt");
if (CryptDecrypt) {
    Interceptor.attach(CryptDecrypt, {
        onLeave: function(retval) {
            // Après le déchiffrement, lire le buffer en clair
            var data = this.args[5].readByteArray(this.args[6].toInt32());
            send({type: "CryptDecrypt", data: Array.from(new Uint8Array(data)).slice(0,64)});
        }
    });
}
"""

def on_message(message, data):
    if message['type'] == 'send':
        payload = message['payload']
        print(f"[HOOK] {payload['type']}: {json.dumps(payload, indent=2)}")

# Attacher Frida au processus suspect
process = frida.spawn(["C:\\Temp\\malware.exe"])
session = frida.attach(process)
script = session.create_script(FRIDA_SCRIPT)
script.on('message', on_message)
script.load()
frida.resume(process)
print("[*] Hooks actifs — Ctrl+C pour arrêter")
sys.stdin.read()
```

### 🚑 Terrain — Retour d'Expérience

**Cas : Contournement de chiffrement custom avec Frida (APT analysis 2024)**

Un analyste RE examine un backdoor qui chiffre ses communications avec un algorithme custom (non-standard). Après 4h d'analyse statique Ghidra sans succès (routine de chiffrement trop obfusquée), il déploie Frida et hooke `send()` et `recv()` au niveau socket, **après** le déchiffrement applicatif. En 15 minutes, il intercepte 3 messages C2 en clair : commandes de reconnaissance, timestamp de heartbeat, et la clé de session XOR. Ce qui avait pris 4h statiquement est résolu en 15 minutes dynamiquement.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PEB** | Process Environment Block — Structure Windows contenant des informations sur le processus, dont le flag IsDebugged |
| **SEH/VEH** | Structured/Vectored Exception Handling — Mécanismes Windows de gestion d'exceptions, exploités pour l'anti-debug |
| **RDTSC** | Read Time-Stamp Counter — Instruction x86 lisant le compteur de cycles CPU (utilisée pour les timing checks anti-debug) |
| **TLS** | Thread Local Storage — Données privées à chaque thread (les TLS Callbacks s'exécutent avant `main()`) |

---

## Exercices Pratiques

### Exercice 1 — Contournement IsDebuggerPresent

Sous GDB, un binaire vérifie `IsDebuggerPresent()` et quitte si le résultat est 1. Comment contourner cette protection avec GDB sans modifier le binaire sur disque ?

**Corrigé guidé :**
1. Breakpoint sur `IsDebuggerPresent` : `break IsDebuggerPresent`
2. Après l'appel, modifier la valeur de retour dans rax : `set $rax = 0`
3. `continue` — la fonction pense ne pas être débuggée et continue.

Alternative : `break *<adresse_du_jnz_apres_IsDebuggerPresent>` + `set $eflags = $eflags & ~0x40` (effacer ZF pour inverser le saut).

### Exercice 2 — Interprétation d'un rapport Cuckoo

Le rapport Cuckoo d'un sample donne `malscore: 9.2` et liste ces signatures :
- `creates_exe` : crée un fichier .exe dans %TEMP%
- `network_tor` : connexion à un nœud Tor Exit
- `persistence_run` : modifie `HKCU\...\Run`

**Question :** Identifiez les techniques MITRE ATT&CK correspondantes.

**Corrigé guidé :**
- `creates_exe` → **T1105 Ingress Tool Transfer** (téléchargement/dépôt de payload)
- `network_tor` → **T1090.003 Proxy: Multi-hop Proxy** (anonymisation C2 via Tor)
- `persistence_run` → **T1547.001 Boot/Logon Autostart: Registry Run Keys** (persistance au démarrage)

---

## Banque QCM — 5 Questions

**Q1.** La commande GDB `x/s $rdi` permet de :

- A) Modifier la valeur du registre rdi
- B) Afficher le contenu de la mémoire pointée par rdi comme une chaîne de caractères ✅
- C) Exécuter la prochaine instruction (step into)
- D) Lister les fonctions dont l'adresse est dans rdi

**Q2.** La technique anti-debugging `RDTSC` est basée sur :

- A) La vérification du flag IsDebugged dans le PEB
- B) La mesure du temps d'exécution entre deux instructions — anormalement long sous debugger ✅
- C) La vérification du nombre de processus actifs sur le système
- D) La détection de breakpoints hardware (DR0-DR7)

**Q3.** Dans Cuckoo Sandbox, un `malscore` de 8.5/10 indique :

- A) Le fichier est 85% similaire à un malware connu en base de données
- B) La sandbox a rencontré des erreurs d'analyse à 15%
- C) L'agrégation de comportements malveillants détectés indique une forte probabilité de malware ✅
- D) Le malware a utilisé 85% des ressources CPU pendant l'analyse

**Q4.** Frida se distingue de GDB pour l'analyse dynamique car :

- A) Frida est plus précis pour l'analyse des registres CPU
- B) Frida permet l'injection de code JavaScript dans un processus **sans l'arrêter**, pour hooker des fonctions à la volée ✅
- C) Frida fonctionne uniquement sur Linux, GDB uniquement sur Windows
- D) Frida ne nécessite pas de privilèges administrateur contrairement à GDB

**Q5.** Les **TLS Callbacks** sont problématiques pour l'analyse avec Ghidra car :

- A) Ghidra ne supporte pas l'architecture x86-64
- B) Ils s'exécutent avant main() et ne sont pas toujours identifiés automatiquement ✅
- C) Ils contournent le système de fichiers et sont donc invisibles
- D) Ghidra ne peut pas désassembler du code dans la section .tls

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
