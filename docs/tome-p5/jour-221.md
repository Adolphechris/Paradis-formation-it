# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 221 (6h) : Forensique Numérique & Investigation Post-Incident (Digital Forensics — Acquisition, Analyse de Mémoire Volatite Volatility, Timeline Plaso & Chaîne de Custody)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **forensique numérique (Digital Forensics & Incident Response — DFIR)** appliquées à l'investigation post-intrusion : acquisition légale de preuves numériques, analyse de la **mémoire vive (RAM)** avec **Volatility 3**, reconstruction de la **timeline d'attaque** avec **Plaso/log2timeline**, et gestion de la **chaîne de custody** (Chain of Custody) pour les opérations bancaires critiques.
>
> **Compétences visées :** `SEC-04` (A) — Digital Forensics & DFIR | `SEC-05` (A) — Volatility Memory Analysis & Timeline Plaso

---

## 1) Module — Principes DFIR & Acquisition Légale de Preuves (2h)

### 📖 Narration/Intuition

Imaginons qu'à 3h du matin, un analyste SOC de la BCC détecte un transfert massif suspect de réserves MNBC vers un portefeuille blockchain inconnu. L'alerte parvient à l'équipe de réponse à incidents (**CSIRT/CERT**) qui doit maintenant reconstituer exactement ce qui s'est passé : qui ? quoi ? comment ? quand ?

C'est le rôle du **Digital Forensics & Incident Response (DFIR)** : une discipline alliant les techniques d'investigation policière numérique aux procédures de réponse aux incidents de cybersécurité.

### 🔍 Anatomie Technique

**Ordre de Volatilité (RFC 3227) — Priorité d'Acquisition des Preuves :**

```
ORDRE DE COLLECTE (du plus volatile au plus stable)
──────────────────────────────────────────────────────
1. 🔴 MÉMOIRE RAM (Contenu volatile — perd en ~10 min après extinction)
   - Processus en cours, clés de chiffrement en RAM, connexions réseau actives
2. 🟠 ÉTAT DU RÉSEAU (Connexions actives, table ARP, routes)
   - Commandes : ss -antp, arp -n, ip route, netstat -rn
3. 🟡 PROCESSUS EN COURS (Liste des processus, arbres de processus)
   - Commandes : ps aux, lsof -p <PID>
4. 🟢 FICHIERS TEMPORAIRES & LOGS (Disk — persistant mais modifiable)
   - /var/log/, /tmp/, ~/.bash_history
5. 🔵 DISQUE DUR (Image forensique complète)
   - DD/dcfldd/FTK Imager — acquisition en lecture seule
──────────────────────────────────────────────────────
```

**Acquisition de la Mémoire RAM (Linux) :**

```bash
# 1. Acquisition mémoire RAM (Serveur SCADA BCC compromis)
# Utilisation de LiME (Linux Memory Extractor — Module Kernel)
sudo insmod /opt/LiME/lime.ko "path=/mnt/forensics/bcc_ram.lime format=lime"

# Vérifier l'intégrité de l'image acquise (Hachage SHA-256 obligatoire)
sha256sum /mnt/forensics/bcc_ram.lime > /mnt/forensics/bcc_ram.lime.sha256
echo "✅ Image RAM acquise et hashée — Chaîne de custody initiée"

# 2. Acquisition disque en lecture seule (Bit-stream)
# /dev/sda = Disque source compromis, /dev/sdb = Disque destination forensique
sudo dd if=/dev/sda of=/mnt/forensics/bcc_disk.img bs=4M status=progress conv=noerror,sync
sha256sum /mnt/forensics/bcc_disk.img > /mnt/forensics/bcc_disk.img.sha256
echo "✅ Image disque acquise — Hash SHA-256 enregistré dans le registre de preuves"
```

---

## 2) Module — Analyse de la Mémoire Volatile avec Volatility 3 (2h)

### 📖 Narration/Intuition

La mémoire **RAM** est un trésor pour l'enquêteur numérique : elle contient les processus en cours d'exécution, les connexions réseau actives, les mots de passe en clair (Mimikatz les extrait de la mémoire LSASS.exe), les artefacts de malwares résidant uniquement en mémoire (fileless malware) et même les clés de chiffrement AES.

**Volatility 3** est le standard de l'industrie pour l'analyse forensique de la mémoire volatile.

### 🛠️ Atelier Pratique

**Analyse Forensique RAM avec Volatility 3 (`volatility_analysis.sh`) :**

```bash
# Image mémoire : bcc_server_ram.lime (Serveur SCADA BCC compromis)
RAM_IMAGE="/mnt/forensics/bcc_server_ram.lime"

# 1. Lister tous les processus actifs au moment de l'acquisition (Équivalent ps aux)
python3 vol.py -f $RAM_IMAGE linux.pslist.PsList

# OUTPUT (Processus suspects détectés) :
# PID  PPID  COMM           START
# 1337 1     nc             2026-08-06 02:47:12    ← Netcat (Reverse shell !)
# 1338 1337  /bin/bash      2026-08-06 02:47:13    ← Shell interactif de l'attaquant
# 2891 1     python3        2026-08-06 02:48:01    ← Script d'exfiltration MNBC ?

# 2. Analyser les connexions réseau actives au moment de la compromission
python3 vol.py -f $RAM_IMAGE linux.netstat.NetStat

# OUTPUT :
# Proto  Src IP          Src Port  Dst IP           Dst Port  PID/Comm
# TCP    192.168.10.100  45231     185.220.101.47   4444      1337/nc
# ↳ Connexion Reverse Shell vers IP suspecte sur port 4444 (C2 Server) !

# 3. Extraire les artefacts du processus malveillant (PID 1337)
python3 vol.py -f $RAM_IMAGE linux.proc.Maps --pid 1337

# 4. Rechercher des chaînes de caractères suspectes (clés API, tokens, credentials)
python3 vol.py -f $RAM_IMAGE linux.strings --pid 2891 | grep -E "(password|token|key|secret|MNBC|blockchain)"
```

---

## 3) Module — Reconstruction de Timeline avec Plaso / log2timeline (2h)

### 📖 Narration/Intuition

Pour reconstituer la chronologie complète d'une attaque (du premier accès initial à l'exfiltration de données), le forensicien utilise **Plaso (log2timeline)** pour agréger et corréler des milliers d'événements provenant de sources hétérogènes (logs système, logs réseau, artefacts de navigateur, registre Windows, logs Bash) et créer une **super-timeline unifiée**.

### 🛠️ Atelier Pratique

**Reconstruction de Timeline avec Plaso (`timeline_bcc.sh`) :**

```bash
# 1. Extraire tous les artefacts temporels depuis l'image disque (log2timeline)
log2timeline.py --parsers=all /mnt/forensics/bcc_timeline.plaso /mnt/forensics/bcc_disk.img

# 2. Filtrer et exporter la timeline en CSV (psort)
psort.py -z UTC -w /mnt/forensics/bcc_timeline.csv /mnt/forensics/bcc_timeline.plaso \
  "date > '2026-08-06 00:00:00' AND date < '2026-08-06 06:00:00'"

# 3. Analyser la timeline (head)
head -50 /mnt/forensics/bcc_timeline.csv

# RÉSULTAT — Chronologie de l'attaque BCC (2026-08-06) :
# 02:31:14 — Connexion SSH depuis 185.220.101.47 (Tor Exit Node !) via compte service "mnbc-worker"
# 02:31:22 — Élévation de privilèges via sudo CVE-2023-27997 (Fortinet PrivEsc)
# 02:33:01 — Téléchargement de nc (Netcat) depuis l'internet
# 02:47:12 — Lancement de reverse shell nc -> 185.220.101.47:4444
# 02:47:53 — Exécution de modbus_attack_bcc.py depuis /tmp/
# 02:48:01 — Lancement de bcc_exfil.py (Script d'exfiltration MNBC)
# 02:51:44 — 1 000 000 MNBC transférés vers wallet inconnu (Tx hash: 0xDEADBEEF...)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DFIR** | Digital Forensics & Incident Response — Forensique Numérique & Réponse aux Incidents |
| **CSIRT** | Computer Security Incident Response Team — Équipe de réponse aux incidents de sécurité |
| **RFC 3227** | Request For Comments 3227 — Guide de collecte et d'archivage de preuves numériques |
| **LiME** | Linux Memory Extractor — Module noyau Linux pour l'acquisition de la mémoire RAM |
| **Plaso** | Outil open-source de reconstruction de super-timeline forensique (log2timeline) |
| **C2** | Command & Control — Serveur de commande et contrôle d'un malware ou d'un attaquant |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi la mémoire **RAM** doit être acquise **en priorité absolue** lors d'une investigation forensique sur un serveur compromis, et ce avant toute autre action (y compris l'isolement réseau).

**Corrigé :** La mémoire **RAM (Random Access Memory)** est par nature **volatile** : son contenu est intégralement perdu lors de l'extinction de la machine (coupure d'alimentation). Elle contient des informations cruciales et impossibles à récupérer autrement : les processus malveillants en cours d'exécution (y compris les **fileless malwares** qui ne s'écrivent jamais sur disque), les connexions réseau actives (identifiant le serveur C2 de l'attaquant), les clés de chiffrement en mémoire (AES, RSA), les sessions utilisateur authentifiées, les mots de passe en clair extraits par des outils comme Mimikatz de LSASS.exe, et les variables d'environnement contenant des tokens ou clés API secrets. Si l'on éteint ou redémarre la machine avant l'acquisition RAM, toutes ces preuves sont **irrémédiablement perdues**. L'ordre de volatilité (RFC 3227) recommande donc : RAM > État réseau > Processus > Logs > Disque.

**Exercice 2 :** Quelles sont les deux commandes Volatility 3 permettant d'identifier (1) la liste des processus actifs et (2) les connexions réseau ouvertes au moment de l'acquisition d'une image mémoire Linux ?

**Corrigé :** (1) Pour lister les processus : `python3 vol.py -f <image.lime> linux.pslist.PsList` — équivalent de la commande `ps aux` sur le système live, listant le PID, PPID, nom du processus et horodatage de démarrage. (2) Pour lister les connexions réseau : `python3 vol.py -f <image.lime> linux.netstat.NetStat` — équivalent de `ss -antp` ou `netstat -antp` sur le système live, affichant les connexions TCP/UDP actives avec les IP sources/destinations, ports et le PID/processus associé.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Selon le standard **RFC 3227 (Guide de collecte de preuves numériques)**, quel support doit être acquis **en premier** lors d'une investigation forensique sur un système compromis en raison de sa nature volatile ?
- A) La mémoire RAM du système
- B) Le disque dur du système
- C) Les logs d'application sur le serveur distant
- D) Les sauvegardes cloud

**Réponse : A**

**Q2 :** Quel outil open-source d'analyse forensique de la mémoire volatile (RAM) est considéré comme le standard de l'industrie et permet d'analyser les images mémoire Linux, Windows et macOS ?
- A) Volatility 3
- B) Nmap
- C) Metasploit
- D) Burp Suite

**Réponse : A**

**Q3 :** Lors de l'analyse d'une image mémoire RAM avec Volatility 3, quel plugin Linux permet de lister toutes les connexions réseau TCP/UDP actives au moment de l'acquisition (équivalent de `netstat -antp`) ?
- A) `linux.netstat.NetStat`
- B) `linux.pslist.PsList`
- C) `linux.proc.Maps`
- D) `windows.netscan.NetScan`

**Réponse : A**

**Q4 :** Quel outil open-source de **reconstruction de super-timeline forensique** agrège les événements depuis des dizaines de sources hétérogènes (logs, artefacts disque, registre Windows) pour créer une chronologie unifiée d'une attaque ?
- A) Plaso / log2timeline
- B) Suricata
- C) OSSEC
- D) OpenVAS

**Réponse : A**

**Q5 :** Dans le cadre d'une investigation forensique légale, pourquoi est-il impératif de calculer le **hash SHA-256** de chaque image forensique (RAM et disque) immédiatement après son acquisition ?
- A) Pour garantir l'intégrité de la preuve et prouver devant un tribunal qu'elle n'a pas été altérée depuis sa collecte (Chaîne de Custody)
- B) Pour compresser l'image forensique et économiser de l'espace disque
- C) Pour chiffrer l'image forensique et la protéger des accès non autorisés
- D) Pour accélérer l'analyse forensique ultérieure

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
