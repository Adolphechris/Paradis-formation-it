# TOME P10 — DFIR & Reverse Engineering — Jour 449 (6h) : Malware Analysis Avancée (Ransomware, RAT, Rootkits & Threat Intelligence)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Analyser en profondeur les **familles de malwares** les plus critiques : Ransomware, RAT (Remote Access Trojan), et Rootkits
> - Comprendre les **techniques de chiffrement** utilisées par les ransomwares (AES + RSA hybride, Curve25519)
> - Extraire les **configurations de C2** d'un RAT et identifier l'infrastructure attaquante
> - Appliquer la **Threat Intelligence** pour contextualiser un malware (attribution, TTPs, campagne)
>
> **Compétences visées :** `SEC-06` (A) — Advanced Malware Analysis, `SEC-05` (A) — Threat Intelligence

---

## Module 1 — Analyse de Ransomware : Chaîne de Chiffrement (2h)

### 📖 Intuition & Narration

En 2024, le coût moyen d'une attaque ransomware pour une grande entreprise dépasse **5 millions de dollars** — rançon, restauration, et perte d'activité confondus. Analyser un ransomware n'est pas qu'un exercice académique : comprendre son mécanisme de chiffrement peut être la clé de la récupération des données sans payer la rançon — si une faiblesse cryptographique est trouvée.

### 🔍 Anatomie Technique — Schéma de Chiffrement Ransomware

```
SCHÉMA DE CHIFFREMENT RANSOMWARE MODERNE (Modèle LockBit/Cl0p)

  ┌─────────────────────────────────────────────────────────────┐
  │  PHASE 1 — GÉNÉRATION DE CLÉS                               │
  │  1a. Le ransomware génère une paire Curve25519 locale       │
  │      (pubkey_victim, privkey_victim)                        │
  │  1b. Le C2 possède la paire maître                          │
  │      (pubkey_master, privkey_master)                        │
  │                                                             │
  │  PHASE 2 — DERIVATION DE CLÉ DE SESSION                    │
  │  2a. ECDH : shared_key = ECDH(privkey_victim, pubkey_master)│
  │  2b. shared_key → KDF → session_key (256-bit AES)          │
  │                                                             │
  │  PHASE 3 — CHIFFREMENT DES FICHIERS                         │
  │  3a. Chaque fichier chiffré avec AES-256-CTR (fast)        │
  │  3b. L'IV AES est unique par fichier                        │
  │                                                             │
  │  PHASE 4 — PROTECTION DE LA CLÉ DE DÉCHIFFREMENT           │
  │  4a. pubkey_victim chiffrée avec pubkey_master (RSA-4096)  │
  │  4b. Résultat stocké dans un footer du fichier chiffré     │
  │                                                             │
  │  RÉSULTAT : Seul le C2 avec privkey_master peut déchiffrer │
  └─────────────────────────────────────────────────────────────┘

ANALYSE FORENSIQUE — OÙ CHERCHER DES FAIBLESSES ?

  ✅ Clé AES/session encore en mémoire RAM (Volatility malfind)
  ✅ Mauvais PRNG (rand() au lieu de CryptGenRandom) → clé prévisible
  ✅ Réutilisation de l'IV AES entre fichiers → attaque multi-IV
  ✅ privkey_victim non effacée de la mémoire après usage
  ✅ Chiffrement séquentiel (pas encore terminé) → fichiers partiels
```

### 🛠️ Atelier Pratique — Extraction de la Clé AES depuis la Mémoire

```python
#!/usr/bin/env python3
"""
PARADIS — Analyse Ransomware : Extraction clé AES depuis dump mémoire
Technique : recherche de clés AES-256 par pattern en mémoire
"""

import re

def find_aes_keys_in_memory(dump_file: str):
    """
    Recherche des clés AES-256 candidates dans un dump mémoire.
    AES-256 = 32 bytes avec distribution d'entropie caractéristique.
    """
    with open(dump_file, 'rb') as f:
        data = f.read()

    # Rechercher des blocs de 32 bytes avec haute entropie
    candidates = []
    # Heuristique : après une opération CryptEncrypt ou AES_set_encrypt_key
    # on cherche des contextes liés aux fonctions crypto Windows
    aes_patterns = [
        rb'\x63\x7c\x77\x7b',  # S-Box AES standard début
        rb'\x00\x01\x02\x03\x04\x05',  # Clé nulle (faible)
    ]

    for pattern in aes_patterns:
        for match in re.finditer(re.escape(pattern), data):
            offset = match.start()
            context = data[offset-32:offset+64]
            candidates.append({
                "offset": hex(offset),
                "context_hex": context.hex(),
                "pattern": pattern.hex()
            })
            print(f"[CANDIDATE] Offset {hex(offset)}: {context[:32].hex()}")

    return candidates

# Recherche avec Volatility 3 (intégration) :
VOLATILITY_CMD = """
vol -f ransomware_victim.mem windows.malfind | grep -A5 "WINWORD\|excel\|notepad"
# → Identifier les processus ciblés par le ransomware
# Puis extraire les pages mémoire contenant des clés :
vol -f ransomware_victim.mem windows.dumpfiles --pid <ransomware_pid>
"""

# Recherche de clés AES avec aeskeyfind (outil spécialisé)
AES_KEYFIND = """
# Outil aeskeyfind : analyse le dump mémoire pour les key schedules AES
aeskeyfind ransomware_victim.mem
# OUTPUT :
# Found 256-bit AES key at offset 0x3a2b1c00 :
# key = a3 f7 2e 8b ... (32 bytes)
# Si la clé est trouvée PENDANT que le ransomware tourne,
# on peut déchiffrer les fichiers sans payer !
"""
print(VOLATILITY_CMD)
print(AES_KEYFIND)
```

---

## Module 2 — Analyse de RAT & Extraction de Configuration C2 (2h)

### 📖 Intuition & Narration

Un **RAT (Remote Access Trojan)** est le couteau suisse de l'attaquant : il lui donne un accès interactif complet à la machine compromise — upload/download de fichiers, capture d'écran, keylogging, shell distant. L'analyste RE qui analyse un RAT cherche un objectif précis : **extraire la configuration** (adresse du C2, port, clé de chiffrement du canal C2) pour remonter à l'infrastructure attaquante.

### 🔍 Anatomie Technique — Familles de RAT & Configuration

```
RATs MAJEURS 2024 — ANALYSE COMPARATIVE

  ┌──────────────────┬────────────┬─────────────────┬─────────────────┐
  │  Famille         │  Langage   │  C2 Protocol    │  Config Storage │
  ├──────────────────┼────────────┼─────────────────┼─────────────────┤
  │  Cobalt Strike   │  Java/C    │  HTTP/HTTPS/DNS │  Malleable C2   │
  │  AsyncRAT        │  .NET C#   │  TCP (AES-CBC)  │  Settings.cs    │
  │  XWorm           │  .NET C#   │  TCP (AES-CBC)  │  RC4 embedded   │
  │  njRAT           │  .NET C#   │  TCP (Base64)   │  Plaintext      │
  │  QuasarRAT       │  .NET C#   │  TLS (custom)   │  JSON encrypted │
  └──────────────────┴────────────┴─────────────────┴─────────────────┘

EXTRACTION DE CONFIG AsyncRAT (exemple)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  AsyncRAT stocke sa config dans la classe Settings.cs :
  ├── Hosts  = "185.220.101.47,evil-domain.ru"
  ├── Ports  = "6606,7707,8808"
  ├── Key    = "AES-256 key encodée en base64"
  └── Certificate = "Certificat TLS auto-signé du C2"

  Extraction avec dnSpy (décompilateur .NET) :
  1. Ouvrir le RAT dans dnSpy
  2. Naviguer : AsyncClient → Settings → Champs statiques
  3. Les valeurs apparaissent en clair si non-obfusquées
  4. Si obfusquées : identifier la routine de déchiffrement
     et l'exécuter en dehors du contexte (extraction dynamique Frida)
```

### 🛠️ Atelier Pratique — Extraction de Config AsyncRAT avec Python

```python
#!/usr/bin/env python3
"""
PARADIS — Extraction de configuration AsyncRAT
Technique : déchiffrement de la config obfusquée (AES-GCM + Base64)
"""

import base64
import hashlib
from Crypto.Cipher import AES

def decrypt_asyncrat_config(encrypted_b64: str, key_b64: str) -> bytes:
    """
    AsyncRAT utilise AES-GCM avec une clé SHA-256 de la passphrase.
    Cette fonction extrait et déchiffre la configuration embarquée.
    """
    # Décoder les données et la clé
    encrypted = base64.b64decode(encrypted_b64)
    key_raw = base64.b64decode(key_b64)

    # Dériver la clé AES-256 via SHA-256
    aes_key = hashlib.sha256(key_raw).digest()

    # Format : [12 bytes IV] [16 bytes GCM Tag] [chiffré]
    iv = encrypted[:12]
    tag = encrypted[12:28]
    ciphertext = encrypted[28:]

    # Déchiffrement AES-GCM
    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=iv)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)

    return plaintext

# Exemple de valeurs extraites de la Settings.cs par dnSpy
ENCRYPTED_CONFIG = "BASE64_ENCRYPTED_CONFIG_HERE"  # Extrait du sample
KEY_BASE64 = "AABB...=="  # Clé extraite

config_raw = decrypt_asyncrat_config(ENCRYPTED_CONFIG, KEY_BASE64)
config_str = config_raw.decode('utf-8')

print("[+] Configuration AsyncRAT déchiffrée :")
for line in config_str.split('|'):
    print(f"  {line}")

# ══════════════════════════════════════════════════════
# IOC EXTRACTION AUTOMATISÉE — YARA + Python
# ══════════════════════════════════════════════════════

ASYNCRAT_YARA = """
rule AsyncRAT_Generic {
    meta:
        description = "Detects AsyncRAT based on .NET strings"
        author = "PARADIS Threat Intel"

    strings:
        $s1 = "AsyncRAT" wide ascii nocase
        $s2 = "Sockets.TcpClient" wide ascii
        $s3 = "ServerSocket" wide ascii
        $s4 = "Disconnect" wide ascii
        $net = { 4D 5A }  // MZ header

    condition:
        $net at 0 and all of ($s*)
}
"""

# Scanner avec yara-python
import yara
rules = yara.compile(source=ASYNCRAT_YARA)
matches = rules.match('/tmp/suspect_rat.exe')
if matches:
    print(f"[MATCH] AsyncRAT détecté ! Règles : {[m.rule for m in matches]}")
```

---

## Module 3 — Threat Intelligence & Attribution (1h30)

### 🔍 Anatomie Technique — Pyramid of Pain (IOC Value)

```
PYRAMID OF PAIN (David Bianco) — VALEUR DES IOCs

  ┌─────────────────────────────────────────────────────────────┐
  │    [TRÈS DIFFICILE À CHANGER]         ▲                     │
  │    TTPs (MITRE ATT&CK Techniques)     │  Le plus précieux  │
  ├─────────────────────────────────────────────────────────────┤
  │    Outils utilisés (Cobalt Strike, Mimikatz)                │
  ├─────────────────────────────────────────────────────────────┤
  │    Artefacts réseau (JA3 hash, User-Agent, Protocol)        │
  ├─────────────────────────────────────────────────────────────┤
  │    Infrastructure réseau (domaines, IPs)                    │
  ├─────────────────────────────────────────────────────────────┤
  │    Hashes de fichiers (MD5, SHA1, SHA256)    Le moins précieux
  │    [TRIVIAL À CHANGER — 1 byte = nouveau hash]       ▼     │
  └─────────────────────────────────────────────────────────────┘

SOURCES DE THREAT INTELLIGENCE

  ✅ MITRE ATT&CK (attack.mitre.org) — Framework TTP
  ✅ VirusTotal (virustotal.com)      — IOC Hash lookup
  ✅ MalwareBazaar (bazaar.abuse.ch)  — Samples téléchargeables
  ✅ AlienVault OTX                   — Pulses partagées communauté
  ✅ MISP (Malware Information Sharing Platform) — Partage IOC
  ✅ Shodan (shodan.io)               — Infrastructure C2 exposée
```

### 🚑 Terrain — Retour d'Expérience

**Attribution APT41 — Double Hat (Cybercriminalité + Espionnage, Chine)**

Lors de l'analyse d'un RAT en .NET, des IOCs sont soumis à VirusTotal et MISP. Les résultats pointent vers un cluster connu : infrastructure IP en commun avec des campagnes précédentes attribuées à **APT41**. Les TTPs matchent : T1059.001 (PowerShell), T1055.012 (Process Hollowing), T1071.001 (C2 HTTPS).

**Enseignement :** La Threat Intelligence transforme un binaire anonyme en une preuve d'attribution à un acteur spécifique. L'analyste qui ne consulte pas les bases TI travaille à l'aveugle.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RAT** | Remote Access Trojan — Malware donnant un accès à distance complet et furtif à la machine compromise |
| **CTR** | Counter Mode — Mode opératoire AES transformant un chiffrement par blocs en chiffrement de flux |
| **KDF** | Key Derivation Function — Fonction dérivant une clé cryptographique depuis une clé ou passphrase maître |
| **TTP** | Tactics, Techniques, and Procedures — Comportements et méthodes caractéristiques d'un acteur de menace |
| **MISP** | Malware Information Sharing Platform — Plateforme open-source de partage d'IOC et de Threat Intelligence |

---

## Exercices Pratiques

### Exercice 1 — Faille Cryptographique Ransomware

Un ransomware utilise `srand(time(NULL))` (C standard) comme source d'entropie pour générer la clé AES de chiffrement, puis efface la clé de la mémoire. La victime connaît l'heure approximative (±10 min) du chiffrement.

**Question :** Cette implémentation est-elle sécurisée ? Comment un analyste pourrait-il récupérer la clé ?

**Corrigé guidé :** NON — `srand(time(NULL))` utilise l'heure Unix (résolution 1 seconde) comme seed. Si l'heure approximative est connue (±600 secondes = 1200 seeds possibles), il est trivial de **bruteforcer** les 1200 seeds, régénérer la clé AES candidate, et tester le déchiffrement. La bonne pratique est `CryptGenRandom()` (Windows) ou `/dev/urandom` (Linux), qui sont cryptographiquement sûrs.

### Exercice 2 — Pyramid of Pain

Vous bloquez l'IP C2 `185.220.101.47` sur votre pare-feu. L'attaquant change son IP C2 le lendemain. Quel niveau de la Pyramid of Pain avez-vous ciblé ? Quelle aurait été une action plus efficace ?

**Corrigé guidé :** Vous avez ciblé le niveau **Infrastructure réseau** (facile à changer). Action plus efficace : bloquer les **TTPs** (ex: détecter le comportement de process hollowing via EDR) ou les **artefacts réseau** (JA3 hash du Cobalt Strike CS default — reste constant même si l'IP change). Le JA3 hash est au niveau "Artefacts réseau" de la pyramide, beaucoup plus difficile à modifier pour l'attaquant.

---

## Banque QCM — 5 Questions

**Q1.** Un ransomware utilise un schéma AES + RSA/Curve25519 hybride. La raison principale est :

- A) RSA seul est plus rapide que AES pour chiffrer des grands fichiers
- B) AES est rapide pour le chiffrement de masse ; RSA/ECDH protège la clé AES pour seul le C2 peut déchiffrer ✅
- C) Les algorithmes hybrides sont requis par la réglementation RGPD
- D) RSA seul ne peut pas chiffrer des fichiers de plus de 256 bytes

**Q2.** La "Pyramid of Pain" classe les IOCs selon :

- A) Leur précision technique
- B) La difficulté pour l'attaquant de les changer et donc leur valeur pour la défense ✅
- C) Le coût de collecte de ces IOCs pour les équipes défensives
- D) La fréquence à laquelle ces IOCs apparaissent dans les rapports de threat intelligence

**Q3.** La clé AES d'un ransomware est potentiellement récupérable **si** :

- A) Le ransomware utilise un algorithme AES-256 standard
- B) La victime a un antivirus installé sur la machine
- C) La machine est analysée en mémoire AVANT le redémarrage, car la clé peut être encore présente en RAM ✅
- D) Le disque dur est chiffré avec BitLocker

**Q4.** Dans l'analyse d'un .NET RAT avec dnSpy, la classe `Settings` contient généralement :

- A) Le code source complet du malware en clair
- B) Les informations de configuration du C2 (IP, port, clé de chiffrement) ✅
- C) La liste des victimes compromises par ce RAT
- D) Les signatures YARA intégrées pour éviter la détection

**Q5.** L'outil **MalwareBazaar** (abuse.ch) est utile pour :

- A) Scanner des URLs suspectes en sandbox
- B) Télécharger des samples de malware identifiés et partager des IOCs avec la communauté ✅
- C) Analyser des dumps mémoire Windows
- D) Décompiler des binaires .NET automatiquement

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
