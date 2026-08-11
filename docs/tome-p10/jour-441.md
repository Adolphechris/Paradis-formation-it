# TOME P10 — DFIR & Reverse Engineering — Jour 441 (6h) : DFIR Fondamentaux & Cadre Incident Response (SANS PICERL, Chaîne de Preuve Numérique & Triage Système)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les **6 phases du cadre SANS PICERL** (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned)
> - Établir une **chaîne de preuve numérique (Chain of Custody)** légalement défendable avec hachage SHA-256/SHA-3
> - Exécuter un **triage forensique initial** d'un système Linux/Windows compromis (ordre de volatilité RFC 3227)
> - Classifier les incidents selon la **matrice NIST SP 800-61r2** (Catégorie, Priorité, Impact)
>
> **Compétences visées :** `SEC-05` (A) — Digital Forensics & Incident Response, `SEC-04` (A) — Sécurité des Systèmes

---

## Module 1 — Le Cadre DFIR & SANS PICERL (2h)

### 📖 Intuition & Narration

Un soir de vendredi, 22h47. L'équipe SOC reçoit une alerte critique : trafic DNS anormal vers un domaine généré algorithmiquement (DGA) depuis le serveur de base de données de production. Deux choix s'offrent à l'analyste en charge :

**Option A — L'Improvisation :** Couper le serveur immédiatement, redémarrer, déclarer victoire. Résultat : preuves détruites, attaquant toujours présent dans le réseau latéral, rapport d'audit impossible.

**Option B — Le DFIR Structuré :** Activer le plan IR, préserver les preuves volatiles en mémoire, contenir l'incident sans alerter l'attaquant, reconstituer la chronologie complète, éradiquer et apprendre.

C'est exactement ce que le cadre **SANS PICERL** formalise : une méthodologie reproductible, défendable en justice, et qui transforme chaque incident en opportunité d'amélioration systémique.

### 🔍 Anatomie Technique — Les 6 Phases PICERL

```
┌─────────────────────────────────────────────────────────────────┐
│                  CADRE SANS PICERL — INCIDENT RESPONSE          │
├──────────┬──────────────────────────────────────────────────────┤
│  PHASE   │  ACTIONS CLÉS                                        │
├──────────┼──────────────────────────────────────────────────────┤
│ P — Prep │  Playbooks IR, SIEM, EDR, runbooks, contacts légaux  │
│ I — Ident│  Détection (SIEM/EDR), triage, classification NIST   │
│ C — Cont │  Isolation réseau, snapshot mémoire, honeypot mirror  │
│ E — Erad │  Suppression malware, patching, nettoyage backdoors   │
│ R — Rec  │  Restauration services, surveillance renforcée 30j    │
│ L — LL   │  Post-Mortem, PIR (Post-Incident Review), leçons      │
└──────────┴──────────────────────────────────────────────────────┘
```

#### Classification NIST SP 800-61r2

| Catégorie | Description | Priorité P1 si… |
|:---|:---|:---|
| **Malicious Code** | Malware, ransomware, worm | Propagation latérale active |
| **Unauthorized Access** | Intrusion, privilege escalation | Serveur de production atteint |
| **Denial of Service** | Inondation, amplification DDoS | > 30% bande passante saturée |
| **Improper Usage** | Exfiltration données, BYOD | Données PII/PCI exposées |
| **Scans & Probes** | Reconnaissance, port scanning | Précède une attaque confirmée |

### 🔍 Anatomie Technique — Ordre de Volatilité (RFC 3227)

```
ORDRE DE COLLECTE DES PREUVES NUMÉRIQUES (du plus au moins volatile)

  1. [VOLATILE] Registres CPU & Cache L1/L2/L3
  2. [VOLATILE] Mémoire RAM (processus en cours, connexions réseau)
  3. [VOLATILE] État réseau (netstat, connexions actives, ARP cache)
  4. [VOLATILE] Processus en cours (PID, parent, handles ouverts)
  5. [VOLATILE] Fichiers temporaires & swap/pagefile
  6. [SEMI-VOLATILE] Disques durs (filesystem, MFT, journaux)
  7. [STABLE] Logs système centralisés (SIEM, Syslog)
  8. [STABLE] Sauvegardes & archives
```

### 🛠️ Atelier Pratique — Triage Linux Initial

```bash
#!/bin/bash
# PARADIS DFIR — Script de Triage Initial Linux
# Ordre de volatilité RFC 3227 — Exécuter avec ROOT

CASE="INC-2024-$(date +%Y%m%d-%H%M%S)"
OUTDIR="/mnt/dfir-usb/${CASE}"
mkdir -p "${OUTDIR}"

echo "[+] PHASE 1 — ÉTAT RÉSEAU (Volatile)"
date -u > "${OUTDIR}/timestamp.txt"
ip addr show > "${OUTDIR}/network_interfaces.txt"
ss -antp > "${OUTDIR}/active_connections.txt"
arp -n > "${OUTDIR}/arp_cache.txt"
cat /proc/net/route > "${OUTDIR}/routing_table.txt"

echo "[+] PHASE 2 — PROCESSUS EN COURS (Volatile)"
ps aux --forest > "${OUTDIR}/process_tree.txt"
# Lister tous les handles ouverts par processus
for pid in $(ls /proc | grep '^[0-9]'); do
    ls -la /proc/${pid}/fd 2>/dev/null >> "${OUTDIR}/open_handles.txt"
done

echo "[+] PHASE 3 — PERSISTENCE & AUTORUN (Semi-Volatile)"
# Crontabs de tous les utilisateurs
for user in $(cut -f1 -d: /etc/passwd); do
    crontab -u "${user}" -l 2>/dev/null >> "${OUTDIR}/crontabs.txt"
done
ls -la /etc/cron* >> "${OUTDIR}/crontabs.txt"
# Systemd services activés
systemctl list-units --type=service --state=running > "${OUTDIR}/running_services.txt"

echo "[+] PHASE 4 — UTILISATEURS & AUTHENTIFICATION"
last -Fwi > "${OUTDIR}/login_history.txt"
lastb -Fwi 2>/dev/null > "${OUTDIR}/failed_logins.txt"
cat /etc/passwd > "${OUTDIR}/passwd.txt"
cat /etc/sudoers > "${OUTDIR}/sudoers.txt" 2>/dev/null

echo "[+] PHASE 5 — HACHAGE & CHAÎNE DE PREUVE"
find "${OUTDIR}" -type f -exec sha256sum {} \; > "${OUTDIR}/SHA256SUMS.txt"
sha256sum "${OUTDIR}/SHA256SUMS.txt"

echo "[TRIAGE COMPLET] Dossier: ${OUTDIR}"
echo "[CHAIN OF CUSTODY] Analyste: $(whoami) | Hôte: $(hostname) | Heure UTC: $(date -u)"
```

### 🚑 Terrain — Retour d'Expérience

**Incident : Ransomware LockBit 3.0 — Secteur Santé (2023)**
Un RSSI raconte : *"Notre première erreur a été de redémarrer les serveurs pour 'nettoyer' avant d'avoir capturé la mémoire RAM. Nous avons perdu la clé de déchiffrement qui se trouvait en mémoire vive, utilisée par le ransomware pour chiffrer les fichiers. L'ordre de volatilité RFC 3227 est non-négociable — un RSSI qui ne le connaît pas expose son organisation à des pertes irrémédiables."*

**Leçon :** La capture mémoire (`LiME` kernel module sous Linux, `WinPMem` sous Windows) doit **toujours** précéder toute action corrective sur un système compromis.

---

## Module 2 — Chaîne de Preuve Numérique & Acquisition Forensique (2h)

### 📖 Intuition & Narration

La preuve numérique est aussi fragile qu'elle est puissante. Un juge a déclaré lors d'un procès pour espionnage industriel : *"Ces logs numériques sont irrecevables car la défense a démontré que l'horodatage système avait été modifié et qu'aucune procédure de chain of custody n'avait été respectée."* Des mois d'investigation forensique réduits à néant.

La **Chain of Custody** (chaîne de preuve) est le protocole qui garantit l'**intégrité, l'authenticité et la traçabilité** de chaque preuve numérique depuis sa collecte jusqu'au tribunal.

### 🔍 Anatomie Technique — Chain of Custody

```
PROTOCOLE CHAIN OF CUSTODY DFIR

┌─────────────────────────────────────────────────────────────────┐
│  FORMULAIRE CHAIN OF CUSTODY — PARADIS DFIR                     │
├──────────────────────┬──────────────────────────────────────────┤
│  Numéro de cas       │  INC-2024-XXXX                           │
│  Date/Heure (UTC)    │  2024-XX-XX THH:MM:SSZ                   │
│  Analyste collecteur │  [Nom, Prénom, Badge ID]                  │
│  Système source      │  [Hostname, IP, MAC, OS Version]          │
│  Support de collecte │  [USB Write-Protected, SHA-256: XXXX]     │
│  Méthode d'imagerie  │  [dd, dcfldd, FTK Imager, Guymager]       │
│  Hash de l'image     │  SHA-256: [HASH] et SHA-3-512: [HASH]     │
│  Témoin présent      │  [Nom, Fonction]                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### 🛠️ Atelier Pratique — Acquisition Disque avec dcfldd

```bash
# ========================================================
# ACQUISITION FORENSIQUE LÉGALE — dcfldd (Enhanced dd)
# Bloc-note la commande AVANT exécution pour signature
# ========================================================

# 1. Vérifier le disque source (NE PAS MONTER)
fdisk -l /dev/sdb

# 2. Activer le write-blocker matériel si disponible, sinon :
blockdev --setro /dev/sdb  # Write-protection logicielle (partielle)

# 3. Acquisition avec hachage parallèle (MD5 + SHA-256)
dcfldd if=/dev/sdb \
    of=/mnt/evidence/INC-2024-evidence.dd \
    hash=md5,sha256 \
    hashlog=/mnt/evidence/INC-2024-hashes.txt \
    hashwindow=1G \
    bs=512 \
    conv=noerror,sync \
    status=on

# 4. Vérification d'intégrité post-acquisition
sha256sum /mnt/evidence/INC-2024-evidence.dd
# → Comparer avec le hash dans INC-2024-hashes.txt

# 5. Signature de la preuve (GPG pour non-répudiation)
gpg --detach-sign --armor \
    --default-key dfir-analyst@company.com \
    /mnt/evidence/INC-2024-evidence.dd

# 6. Compression sécurisée pour archivage
gzip -9 /mnt/evidence/INC-2024-evidence.dd
sha256sum /mnt/evidence/INC-2024-evidence.dd.gz \
    >> /mnt/evidence/INC-2024-hashes.txt
```

---

## Module 3 — Triage Windows Avancé & Artefacts Forensiques (1h30)

### 🔍 Anatomie Technique — Artefacts Windows Clés

```
ARTEFACTS FORENSIQUES WINDOWS — HIÉRARCHIE DE VALEUR

  TIER 1 — GOLD (Evidence directe d'activité malveillante)
  ├── Windows Event Logs    C:\Windows\System32\winevt\Logs\
  │   ├── Security.evtx    → Logons (4624), Privilege Escalation (4672)
  │   ├── System.evtx      → Services installés (7045), crashes
  │   └── PowerShell.evtx  → Execution (4103/4104), ScriptBlock
  ├── $MFT (Master File Table)  → Timestamps MACB (Modified/Access/Changed/Born)
  ├── Prefetch Files        C:\Windows\Prefetch\*.pf
  └── Shimcache / AmCache  → Programmes exécutés même après suppression

  TIER 2 — SILVER (Evidence de présence et persistance)
  ├── Registry             HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
  ├── Scheduled Tasks      C:\Windows\System32\Tasks\
  ├── NTUSER.DAT           → RecentDocs, UserAssist, TypedPaths
  └── LNK Files            C:\Users\*\AppData\Roaming\Microsoft\Recent\

  TIER 3 — BRONZE (Evidence contextuelle)
  ├── Browser History      SQLite DBs (Chrome/Firefox/Edge)
  ├── Thumbcache           → Images visualisées
  └── Windows Search DB    WindowsSearch.edb
```

### 🛠️ Atelier Pratique — Triage Windows avec PowerShell

```powershell
# PARADIS DFIR — Triage Windows PowerShell
# Exécuter en tant qu'Administrateur

$CaseID = "INC-2024-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$OutDir = "D:\DFIR\$CaseID"
New-Item -ItemType Directory -Path $OutDir | Out-Null

# 1. Connexions réseau actives
netstat -ano | Out-File "$OutDir\netstat.txt"
Get-NetTCPConnection | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess |
    Export-Csv "$OutDir\tcp_connections.csv" -NoTypeInformation

# 2. Processus en cours avec chemins complets
Get-Process | Select-Object Id, Name, Path, StartTime, CPU |
    Sort-Object StartTime |
    Export-Csv "$OutDir\processes.csv" -NoTypeInformation

# 3. Services installés récemment (7045 = Service Installed)
Get-WinEvent -LogName System -FilterXPath "*[System[EventID=7045]]" -MaxEvents 100 |
    Select-Object TimeCreated, Message |
    Export-Csv "$OutDir\new_services.csv" -NoTypeInformation

# 4. Comptes locaux & groupes d'administration
Get-LocalUser | Export-Csv "$OutDir\local_users.csv" -NoTypeInformation
Get-LocalGroupMember -Group "Administrators" | Export-Csv "$OutDir\admins.csv" -NoTypeInformation

# 5. Clés de persistance Registry Run
$RunKeys = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
)
foreach ($key in $RunKeys) {
    Get-ItemProperty $key -ErrorAction SilentlyContinue |
        Out-File "$OutDir\registry_run.txt" -Append
}

# 6. Hachage des preuves collectées
Get-ChildItem $OutDir -File | ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    "$hash  $($_.Name)"
} | Out-File "$OutDir\SHA256SUMS.txt"

Write-Host "[TRIAGE COMPLET] $OutDir"
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DFIR** | Digital Forensics & Incident Response — Discipline combinant investigation numérique et gestion d'incidents de sécurité |
| **PICERL** | Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned — Cadre SANS pour la réponse aux incidents |
| **MFT** | Master File Table — Structure centrale du système de fichiers NTFS répertoriant tous les fichiers |
| **MACB** | Modified, Accessed, Changed, Born — Les 4 timestamps forensiques d'un fichier (Analyse de timeline) |
| **PIR** | Post-Incident Review — Réunion formelle post-incident pour identifier les améliorations systémiques |
| **DGA** | Domain Generation Algorithm — Technique malware générant des milliers de domaines pour éviter les blocages DNS |

---

## Exercices Pratiques

### Exercice 1 — Plan IR : Classification d'Incidents

Vous recevez l'alerte suivante : *"Un poste utilisateur RH exfiltre 2 Go de données vers l'IP 185.220.101.X (nœud Tor connu) depuis 48h."*

**Question :** Selon NIST SP 800-61r2, quelle est la catégorie, la priorité et les 3 premières actions PICERL immédiates ?

**Corrigé guidé :**
- **Catégorie :** Unauthorized Access / Data Exfiltration (PII)
- **Priorité :** P1 — Critique (données personnelles exposées, acteur externe confirmé)
- **Actions immédiates (Identification → Containment) :**
  1. **Isolation réseau contrôlée** : Couper l'accès Internet du poste sans redémarrage (VLAN quarantaine)
  2. **Capture mémoire immédiate** : `LiME` ou `WinPMem` avant toute action corrective
  3. **Préservation logs** : Extraire et hasher les logs proxy/firewall des 72 dernières heures

### Exercice 2 — Chain of Custody : Validation d'Intégrité

Après acquisition d'un disque, le hash SHA-256 enregistré est `a3f7...d91c`. Après transfert vers l'équipe juridique, le hash recalculé donne `a3f7...d91c`. Que concluez-vous ? Et si les hashes diffèrent ?

**Corrigé guidé :**
- **Hashes identiques :** Intégrité confirmée — la preuve n'a pas été altérée pendant le transport. Défendable en justice.
- **Hashes différents :** La preuve est compromise — elle ne peut pas être présentée en justice. Déclencher un audit Chain of Custody : qui a eu accès au support entre la collecte et la vérification ?

---

## Banque QCM — 5 Questions (Validation des acquis)

**Q1.** Selon RFC 3227, quel artefact doit être collecté EN PREMIER lors d'un triage forensique ?

- A) Les logs système centralisés (SIEM)
- B) L'image disque complète
- C) La mémoire RAM et les connexions réseau actives ✅
- D) Les fichiers prefetch Windows

**Corrigé Q1 :** C — La mémoire vive est l'élément le plus volatile : elle contient les processus actifs, clés de chiffrement, connexions réseau et artefacts malveillants qui disparaissent au redémarrage.

---

**Q2.** Dans le cadre SANS PICERL, la phase "Containment" vise principalement à :

- A) Supprimer définitivement le malware du système
- B) Empêcher la propagation tout en préservant les preuves ✅
- C) Restaurer les services à leur état nominal
- D) Rédiger le rapport post-incident

**Corrigé Q2 :** B — Le Containment isole l'incident (VLAN quarantaine, blocage IP) sans nettoyer le système, préservant ainsi les preuves pour l'analyse forensique ultérieure.

---

**Q3.** Un Event ID Windows `4672` dans Security.evtx indique :

- A) Un échec d'authentification (failed logon)
- B) L'installation d'un nouveau service système
- C) Une assignation de privilèges spéciaux (ex: SeDebugPrivilege) ✅
- D) La suppression d'un compte utilisateur

**Corrigé Q3 :** C — L'Event ID 4672 "Special Privileges Assigned" est un indicateur clé d'élévation de privilèges ou de compte administrateur utilisé. Souvent précède des activités malveillantes sophistiquées.

---

**Q4.** La technique d'analyse **AmCache** permet de :

- A) Analyser le trafic réseau chiffré TLS
- B) Reconstituer l'historique des applications exécutées, même supprimées ✅
- C) Décrypter les mots de passe stockés en mémoire
- D) Analyser les métadonnées des documents Office

**Corrigé Q4 :** B — L'AmCache (C:\Windows\AppCompat\Programs\Amcache.hve) conserve des métadonnées (hashes SHA1, timestamps d'exécution) des programmes exécutés, y compris ceux ultérieurement supprimés du disque.

---

**Q5.** Quelle affirmation sur la Chain of Custody est INCORRECTE ?

- A) Chaque transfert de preuve doit être documenté et signé
- B) Le hash SHA-256 doit être recalculé à chaque étape de transfert
- C) Une preuve dont l'intégrité est compromise peut quand même être utilisée si elle est convaincante ✅
- D) La date et l'heure UTC de collecte doivent être enregistrées

**Corrigé Q5 :** C — FAUX. Une preuve numérique dont la Chain of Custody est rompue est irrecevable en justice, quelle que soit sa valeur apparente. L'intégrité légale est non-négociable.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
