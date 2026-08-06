# TOME P0 — Socle Universel — Jour 32 (6h) : Python Intermédiaire — Modules, Bibliothèques & Scripting Système

> [!NOTE]
> **Objectif du jour :** Maîtriser les bibliothèques standards Python essentielles pour l'administration système et la cybersécurité : `os`, `sys`, `subprocess`, `re`, `json`. Savoir lire et comprendre un script utilisant ces modules, et savoir les utiliser pour automatiser des tâches d'administration.
>
> **Compétences visées :** `BIT-05` (A) — Scripting et automatisation | `SEC-05` (A) — Analyse de scripts système

---

## 1) Module — Fonctions & Modules Python (2h)

### 📖 Narration/Intuition

Un script Python bien structuré est un ensemble de **fonctions** organisées en **modules**. Comprendre cette organisation est fondamental pour analyser du code inconnu : on repère d'abord les fonctions (les blocs `def`), on comprend leur rôle, et on remonte au bloc principal (`if __name__ == "__main__":`).

Un module Python est simplement un fichier `.py`. Une bibliothèque est un ensemble de modules. L'écosystème Python (PyPI) contient plus de 400 000 packages — mais pour l'administration système et la sécurité, quelques bibliothèques standards suffisent pour 80% des cas.

### 🔍 Anatomie Technique

**Définition et lecture de fonctions :**

```python
# Anatomie d'une fonction Python
def analyser_log(chemin_fichier, niveau="ERROR"):
    """
    Docstring : description de la fonction.
    
    Args:
        chemin_fichier (str): Chemin vers le fichier de log
        niveau (str): Niveau de filtre (défaut: "ERROR")
    
    Returns:
        list: Liste des lignes contenant le niveau cherché
    """
    resultats = []
    
    try:
        with open(chemin_fichier, "r", encoding="utf-8") as f:
            for numero, ligne in enumerate(f, start=1):
                if niveau in ligne:
                    resultats.append(f"L{numero}: {ligne.rstrip()}")
    except FileNotFoundError:
        return []  # Retour anticipé en cas d'erreur
    
    return resultats

# Arguments positionnels et nommés
erreurs = analyser_log("/var/log/syslog", niveau="ERROR")
warnings = analyser_log("/var/log/syslog", "WARNING")
```

**Le point d'entrée `__name__` :**

```python
# Ce pattern est fondamental pour lire n'importe quel script Python
def main():
    """Fonction principale du script."""
    print("Script lancé directement")

def fonction_utilitaire():
    """Peut être importée par d'autres scripts."""
    return "utilitaire"

# Ce bloc s'exécute SEULEMENT quand le script est lancé directement
# Pas quand il est importé comme module par un autre script
if __name__ == "__main__":
    main()
```

**Imports et namespaces :**

```python
# Import du module entier (accès via module.fonction)
import os
import os.path

chemin = os.path.join("/var", "log", "syslog")  # /var/log/syslog
existe = os.path.exists(chemin)

# Import sélectif (accès direct)
from pathlib import Path
from datetime import datetime, timedelta

# Import avec alias (pour les noms longs)
import subprocess as sp
import json as j
```

### 🛠️ Atelier Pratique

Lisez et analysez ce script complet :

```python
#!/usr/bin/env python3
"""Analyseur de logs système — outil d'audit."""
import os
import re
import json
import sys
from datetime import datetime

def lire_fichier(chemin):
    """Lit un fichier et retourne la liste de ses lignes."""
    if not os.path.isfile(chemin):
        print(f"ERREUR: {chemin} n'existe pas", file=sys.stderr)
        sys.exit(1)
    
    with open(chemin, "r", encoding="utf-8", errors="replace") as f:
        return f.readlines()

def filtrer_erreurs(lignes, pattern=r"(ERROR|CRITICAL|FATAL)"):
    """Filtre les lignes correspondant au pattern regex."""
    regex = re.compile(pattern, re.IGNORECASE)
    return [l.strip() for l in lignes if regex.search(l)]

def generer_rapport(erreurs, fichier_sortie=None):
    """Génère un rapport JSON à partir des erreurs trouvées."""
    rapport = {
        "timestamp": datetime.now().isoformat(),
        "total_erreurs": len(erreurs),
        "erreurs": erreurs[:50]  # Limite à 50
    }
    
    if fichier_sortie:
        with open(fichier_sortie, "w") as f:
            json.dump(rapport, f, indent=2, ensure_ascii=False)
        print(f"Rapport sauvegardé : {fichier_sortie}")
    else:
        print(json.dumps(rapport, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    cible = sys.argv[1] if len(sys.argv) > 1 else "/var/log/syslog"
    sortie = sys.argv[2] if len(sys.argv) > 2 else None
    
    lignes = lire_fichier(cible)
    erreurs = filtrer_erreurs(lignes)
    generer_rapport(erreurs, sortie)
```

**Questions de lecture :**
1. Que fait `sys.exit(1)` ?
2. Que signifie `file=sys.stderr` ?
3. Que fait `re.compile(pattern, re.IGNORECASE)` ?
4. Quelle est la valeur de `cible` si le script est lancé sans argument ?

---

## 2) Module — Bibliothèques Système : os, sys, subprocess (2h)

### 📖 Narration/Intuition

Ces trois bibliothèques sont le couteau suisse de l'administrateur système en Python. On les retrouve dans **presque tous** les scripts d'automatisation, d'audit et de sécurité. Savoir les lire est indispensable.

### 🔍 Anatomie Technique

**Bibliothèque `os` — Interface avec le système d'exploitation :**

```python
import os

# Informations système
print(os.getpid())          # PID du processus courant (Process ID)
print(os.getppid())         # PID du processus parent (Parent PID)
print(os.getuid())          # UID de l'utilisateur courant (Unix seulement)
print(os.getcwd())          # Répertoire de travail courant (Current Working Directory)
print(os.environ.get("HOME"))  # Variable d'environnement $HOME

# Manipulation de fichiers et répertoires
os.makedirs("/tmp/audit/logs", exist_ok=True)  # Crée les répertoires (récursivement)
os.remove("/tmp/fichier_temp.txt")             # Supprime un fichier
os.rename("ancien.log", "nouveau.log")         # Renomme

# Parcours de l'arborescence
for racine, dossiers, fichiers in os.walk("/etc"):
    for fichier in fichiers:
        chemin_complet = os.path.join(racine, fichier)
        if fichier.endswith(".conf"):
            print(chemin_complet)

# Permissions et métadonnées
stat = os.stat("/etc/passwd")
print(f"Taille: {stat.st_size} octets")
print(f"Dernière modification: {stat.st_mtime}")
```

**Bibliothèque `sys` — Interface avec l'interpréteur Python :**

```python
import sys

# Arguments de la ligne de commande
# Si lancé : python3 script.py /var/log/syslog output.json
print(sys.argv)       # ['script.py', '/var/log/syslog', 'output.json']
print(sys.argv[0])    # 'script.py' (le script lui-même)
print(sys.argv[1:])   # ['/var/log/syslog', 'output.json'] (les arguments)

# Sorties standard
print("Message normal", file=sys.stdout)  # Sortie standard (défaut)
print("ERREUR!", file=sys.stderr)         # Sortie d'erreur (stderr)

# Quitter le programme
sys.exit(0)   # Succès (code de retour 0)
sys.exit(1)   # Échec (code de retour non-nul)

# Informations sur l'environnement Python
print(sys.version)        # Version Python
print(sys.platform)       # 'linux', 'darwin', 'win32'
```

**Bibliothèque `subprocess` — Exécution de commandes système :**

```python
import subprocess

# Exécution sécurisée d'une commande (TOUJOURS utiliser une liste, jamais shell=True)
resultat = subprocess.run(
    ["netstat", "-tulnp"],          # Commande en liste (évite l'injection)
    capture_output=True,            # Capture stdout et stderr
    text=True,                      # Décode en string UTF-8
    timeout=10                      # Timeout en secondes
)

# Accès aux résultats
print(resultat.stdout)        # Sortie standard de la commande
print(resultat.stderr)        # Sortie d'erreur
print(resultat.returncode)    # Code de retour (0 = succès)

# Vérifier le succès
if resultat.returncode == 0:
    print("Commande réussie")
else:
    print(f"Erreur : {resultat.stderr}")

# Pattern courant : vérifier si un service tourne
def service_actif(nom_service):
    """Vérifie si un service systemd est actif."""
    r = subprocess.run(
        ["systemctl", "is-active", nom_service],
        capture_output=True, text=True
    )
    return r.stdout.strip() == "active"

print(service_actif("ssh"))    # True ou False
```

### 🛠️ Atelier Pratique — Script d'Audit Système

```python
#!/usr/bin/env python3
"""Audit rapide de la posture de sécurité du système."""
import os
import subprocess
import sys

def verifier_ssh_config():
    """Vérifie la configuration SSH."""
    constats = []
    config_path = "/etc/ssh/sshd_config"
    
    if not os.path.exists(config_path):
        return ["SSH non installé"]
    
    with open(config_path) as f:
        contenu = f.read()
    
    checks = {
        "PermitRootLogin no": "Root SSH désactivé",
        "PasswordAuthentication no": "Auth par mot de passe désactivée",
        "X11Forwarding no": "X11 Forwarding désactivé",
    }
    
    for parametre, description in checks.items():
        if parametre in contenu:
            constats.append(f"[✓] {description}")
        else:
            constats.append(f"[✗] {description} — NON CONFIGURÉ")
    
    return constats

def lister_ports_ouverts():
    """Liste les ports TCP en écoute."""
    r = subprocess.run(
        ["ss", "-tlnp"],
        capture_output=True, text=True
    )
    return r.stdout

if __name__ == "__main__":
    print("=== AUDIT SÉCURITÉ SSH ===")
    for constat in verifier_ssh_config():
        print(constat)
    
    print("\n=== PORTS TCP EN ÉCOUTE ===")
    print(lister_ports_ouverts())
```

---

## 3) Module — Expressions Régulières (re) & JSON (2h)

### 📖 Narration/Intuition

Les **expressions régulières** (regex) sont le couteau suisse de la recherche dans le texte. Elles apparaissent dans presque tous les scripts d'analyse de logs, de détection d'intrusion, et de parsing de configuration. Les **maîtriser en lecture** (pas nécessairement en écriture) est une compétence clé.

**JSON** (JavaScript Object Notation) est le format universel d'échange de données. Toutes les API, tous les outils de sécurité modernes (SIEM, EDR, SOAR) communiquent via JSON.

### 🔍 Anatomie Technique

**Expressions régulières — lecture des patterns courants :**

```python
import re

# Patterns courants à reconnaître
patterns = {
    r"\d+"          : "Un ou plusieurs chiffres",
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}" : "Adresse IPv4 approximative",
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" : "Adresse email",
    r"(ERROR|WARNING|CRITICAL)" : "Niveaux de log",
    r"^\s*#"        : "Ligne commençant par # (commentaire)",
    r"\b25[0-5]|2[0-4]\d|[01]?\d\d?\b" : "Octet d'adresse IP (0-255)",
}

# Méthodes principales de re
texte = "Connexion échouée depuis 192.168.1.105 le 2024-01-15 à 23:42:01"

# search() : trouve le PREMIER match n'importe où dans la chaîne
ip_match = re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", texte)
if ip_match:
    print(f"IP trouvée : {ip_match.group()}")  # 192.168.1.105

# findall() : retourne TOUS les matches sous forme de liste
chiffres = re.findall(r"\d+", texte)
print(chiffres)  # ['192', '168', '1', '105', '2024', '01', '15', '23', '42', '01']

# sub() : remplace les matches
anonymise = re.sub(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", "X.X.X.X", texte)
print(anonymise)  # Connexion échouée depuis X.X.X.X le...

# Groupes de capture : extraire des parties du match
pattern_log = r"(\d{4}-\d{2}-\d{2}) à (\d{2}:\d{2}:\d{2})"
match = re.search(pattern_log, texte)
if match:
    date = match.group(1)   # "2024-01-15"
    heure = match.group(2)  # "23:42:01"
```

**Manipulation JSON :**

```python
import json

# Désérialisation : JSON string → Python dict
json_string = '{"ip": "192.168.1.1", "port": 22, "status": "open"}'
donnees = json.loads(json_string)
print(donnees["ip"])     # "192.168.1.1"
print(type(donnees))     # <class 'dict'>

# Désérialisation depuis fichier
with open("rapport.json", "r") as f:
    rapport = json.load(f)

# Sérialisation : Python dict → JSON string
alerte = {
    "type": "intrusion",
    "source": "192.168.1.105",
    "timestamp": "2024-01-15T23:42:01",
    "details": ["brute_force", "ssh", "3847 tentatives"]
}

# json.dumps() : dict → string
json_sortie = json.dumps(alerte, indent=2, ensure_ascii=False)
print(json_sortie)

# Sérialisation vers fichier
with open("alerte.json", "w") as f:
    json.dump(alerte, f, indent=2, ensure_ascii=False)
```

### 🚑 Terrain — Lecture d'un Script de Parsing de Log Auth

```python
#!/usr/bin/env python3
"""Détecteur de tentatives de brute force SSH."""
import re
import sys
from collections import Counter

SEUIL_ALERTE = 10  # Nombre de tentatives avant alerte

def analyser_auth_log(chemin="/var/log/auth.log"):
    pattern = re.compile(
        r"Failed password for (?:invalid user )?(\w+) from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
    )
    tentatives = []
    
    try:
        with open(chemin, "r") as f:
            for ligne in f:
                match = pattern.search(ligne)
                if match:
                    utilisateur = match.group(1)
                    ip_source = match.group(2)
                    tentatives.append(ip_source)
    except PermissionError:
        print("Permission refusée — lancez avec sudo", file=sys.stderr)
        return
    
    # Counter compte les occurrences
    compteur_ip = Counter(tentatives)
    
    print(f"\nTentatives SSH échouées :")
    for ip, nb in compteur_ip.most_common(10):
        statut = "⚠ ALERTE" if nb >= SEUIL_ALERTE else "  normal"
        print(f"  {statut} | {ip:15s} | {nb:4d} tentatives")

analyser_auth_log()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **regex / RE** | Regular Expression — expression régulière pour la recherche de patterns dans du texte |
| **JSON** | JavaScript Object Notation — format léger d'échange de données |
| **PID** | Process ID — identifiant unique d'un processus système |
| **PPID** | Parent Process ID — identifiant du processus parent |
| **API** | Application Programming Interface — interface de programmation applicative |
| **stdin / stdout / stderr** | Standard Input / Output / Error — flux d'entrée/sortie standard et d'erreur |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Que fait ce code ? Décrivez en français :

```python
import subprocess, re

r = subprocess.run(["ss", "-tlnp"], capture_output=True, text=True)
ports = re.findall(r":(\d{2,5})\s", r.stdout)
ports_uniques = sorted(set(int(p) for p in ports if int(p) < 65536))
print(f"Ports ouverts : {ports_uniques}")
```

**Corrigé :** Exécute `ss -tlnp` pour lister les ports TCP en écoute, extrait tous les numéros de port avec une regex, supprime les doublons (`set`), convertit en entiers, filtre les ports valides (<65536), trie et affiche la liste.

**Exercice 2 :** Écrivez en pseudocode l'algorithme de `analyser_auth_log()` sans regarder le code.

**Corrigé :**
1. Compiler une regex pour les lignes "Failed password"
2. Ouvrir `/var/log/auth.log` ligne par ligne
3. Pour chaque ligne : chercher un match → extraire IP source
4. Compter les occurrences par IP
5. Afficher les 10 IPs les plus actives avec alerte si > seuil

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence entre `subprocess.run(["ls", "-la"])` et `subprocess.run("ls -la", shell=True)` ?
- A) Aucune différence pratique
- B) La version liste est sécurisée ; `shell=True` expose aux injections de commande
- C) `shell=True` est toujours plus rapide
- D) La version liste ne fonctionne pas sur Linux

**Réponse : B**

---

**Q2 :** Que retourne `re.findall(r"\d+", "port 22, ip 192.168.1.1")` ?
- A) `["22", "192", "168", "1", "1"]`
- B) `["22", "192.168.1.1"]`
- C) `"22 192 168 1 1"`
- D) `True`

**Réponse : A** — `findall` retourne tous les segments de chiffres consécutifs.

---

**Q3 :** À quoi sert `if __name__ == "__main__":` ?
- A) À définir le nom du script
- B) À s'assurer que le bloc s'exécute seulement si le script est lancé directement (pas importé)
- C) À vérifier les permissions de l'utilisateur
- D) À nommer la fonction principale

**Réponse : B**

---

**Q4 :** `json.loads('{"port": 22}')` retourne :
- A) La chaîne `'{"port": 22}'`
- B) Un dictionnaire Python `{"port": 22}`
- C) Un entier `22`
- D) Une erreur de syntaxe

**Réponse : B** — `loads` = Load String → convertit JSON string en objet Python.

---

**Q5 :** `os.walk("/etc")` permet de :
- A) Lire le contenu d'un seul fichier
- B) Parcourir récursivement tous les fichiers et dossiers sous `/etc`
- C) Copier `/etc` vers une autre destination
- D) Vérifier les permissions de `/etc`

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
