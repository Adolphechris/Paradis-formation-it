# TOME P0 — Socle Universel — Jour 31 (6h) : Python Fondamentaux & Lecture de Code

> [!NOTE]
> **Objectif du jour :** Maîtriser la lecture et la compréhension du code Python. À la fin de cette journée, vous serez capable d'analyser n'importe quel script Python inconnu, d'identifier ce qu'il fait, de repérer ses structures de contrôle, et de l'adapter à votre contexte — sans nécessairement le réécrire de zéro.
>
> **Compétences visées :** `BIT-05` (A) — Scripting et automatisation | `SEC-05` (A) — Lecture et analyse de code

---

## 1) Module — Anatomie du Langage Python (2h)

### 📖 Narration/Intuition

Imaginez que vous êtes expert en sécurité, et que vous interceptez un script Python utilisé par un attaquant. Vous n'avez pas besoin de l'avoir écrit vous-même pour le comprendre : vous devez **lire le code** comme un détective lit un dossier. Python est conçu pour être lisible — c'est sa force. Son indentation stricte force une structure claire.

Un master en cybersécurité qui ne peut pas lire du Python est comme un médecin légiste qui ne peut pas lire un rapport d'autopsie. La compréhension prime sur la production.

### 🔍 Anatomie Technique

**Les types natifs Python — lecture rapide :**

```python
# Types scalaires
age = 25            # int (entier)
temperature = 36.6  # float (décimal)
nom = "Alice"       # str (chaîne de caractères)
actif = True        # bool (booléen : True ou False)
vide = None         # NoneType (valeur nulle)

# Types composites
ports = [22, 80, 443, 8080]          # list (liste ordonnée, modifiable)
config = {"host": "10.0.0.1", "port": 22}  # dict (dictionnaire clé:valeur)
protocoles = ("TCP", "UDP", "ICMP")  # tuple (liste non modifiable)
ip_uniques = {192, 168, 1, 1}        # set (ensemble sans doublons)
```

**Lire les opérateurs :**

```python
# Opérateurs de comparaison (retournent True/False)
x = 10
print(x > 5)    # True
print(x == 10)  # True (égalité, double ==)
print(x != 3)   # True (différent de)

# Opérateurs logiques
print(x > 5 and x < 20)  # True (ET logique)
print(x < 3 or x > 8)    # True (OU logique)
print(not x == 0)         # True (NON logique)
```

**Lire les structures de contrôle :**

```python
# if / elif / else
score = 78

if score >= 75:
    print("Validé — accès au jour suivant")
elif score >= 60:
    print("Avertissement — révisions requises")
else:
    print("Échec — jour verrouillé")

# Boucle for (itération sur une séquence)
ports_critiques = [22, 80, 443]
for port in ports_critiques:
    print(f"Vérification du port {port}...")

# Boucle while (condition)
tentatives = 0
while tentatives < 3:
    print(f"Tentative #{tentatives + 1}")
    tentatives += 1
```

### 🛠️ Atelier Pratique — Analyser un Script Inconnu

**Exercice de lecture :** Lisez ce script et répondez aux questions SANS l'exécuter :

```python
#!/usr/bin/env python3
"""Script d'inventaire réseau — Version 1.0"""
import datetime

SEUIL_ALERTE = 80
rapport = []

serveurs = {
    "srv-web01": {"cpu": 45, "ram": 67, "disk": 82},
    "srv-db01":  {"cpu": 91, "ram": 78, "disk": 55},
    "srv-bkp01": {"cpu": 12, "ram": 34, "disk": 90},
}

for nom_serveur, metriques in serveurs.items():
    alertes = []
    for ressource, valeur in metriques.items():
        if valeur > SEUIL_ALERTE:
            alertes.append(f"{ressource.upper()}: {valeur}%")
    
    statut = "CRITIQUE" if alertes else "OK"
    rapport.append({
        "serveur": nom_serveur,
        "statut": statut,
        "alertes": alertes,
        "horodatage": datetime.datetime.now().isoformat()
    })

for ligne in rapport:
    if ligne["statut"] == "CRITIQUE":
        print(f"[ALERTE] {ligne['serveur']} — {', '.join(ligne['alertes'])}")
    else:
        print(f"[OK] {ligne['serveur']}")
```

**Questions de lecture (sans exécuter) :**
1. Quel est le seuil au-dessus duquel une alerte est déclenchée ?
2. Combien de serveurs ont un statut CRITIQUE ? Lesquels ? Sur quelle ressource ?
3. Que contient la variable `rapport` à la fin de l'exécution ?
4. Que fait `serveurs.items()` dans la boucle `for` ?

### 🚑 Terrain — Glossaire de Lecture Rapide

| Syntaxe | Signification |
|:---:|:---|
| `f"texte {variable}"` | f-string : interpolation de variable dans une chaîne |
| `dict.items()` | Retourne les paires clé-valeur d'un dictionnaire |
| `liste.append(x)` | Ajoute `x` à la fin de la liste |
| `"texte".upper()` | Convertit en MAJUSCULES |
| `", ".join(liste)` | Joint les éléments avec `, ` comme séparateur |
| `datetime.datetime.now()` | Horodatage courant |

---

## 2) Module — Variables, Portée & Structures de Données (2h)

### 📖 Narration/Intuition

Comprendre la **portée** (scope) des variables est essentiel pour analyser du code. Une variable définie dans une fonction n'existe que dans cette fonction. C'est pourquoi un malware peut isoler ses données sensibles dans des fonctions pour les cacher.

### 🔍 Anatomie Technique

**Portée des variables (scope) :**

```python
# Variable globale
CIBLE = "192.168.1.1"  # Accessible partout (convention : MAJUSCULES)

def scanner():
    # Variable locale : n'existe QUE dans scanner()
    resultat = "port ouvert"
    print(f"Scan de {CIBLE} : {resultat}")

scanner()
# print(resultat)  # ERREUR : resultat n'existe pas ici

# Mot-clé global (modification d'une variable globale depuis une fonction)
compteur = 0

def incrementer():
    global compteur
    compteur += 1

incrementer()
print(compteur)  # 1
```

**Manipulation des listes :**

```python
historique = ["login", "scan", "exploit"]

# Lecture
print(historique[0])    # "login" (index 0)
print(historique[-1])   # "exploit" (dernier élément)
print(historique[1:])   # ["scan", "exploit"] (slicing)

# Modification
historique.append("exfil")       # Ajoute en fin
historique.insert(0, "recon")    # Insère en position 0
historique.remove("scan")        # Supprime "scan"
del historique[1]                # Supprime l'index 1

# Iteration
for action in historique:
    print(action)
```

**Manipulation des dictionnaires :**

```python
config_ssh = {
    "host": "10.0.0.1",
    "port": 22,
    "user": "admin",
    "key_auth": True
}

# Lecture sécurisée (évite les KeyError)
port = config_ssh.get("port", 22)       # 22 (ou 22 par défaut)
timeout = config_ssh.get("timeout", 30) # 30 (clé absente, valeur par défaut)

# Test d'existence
if "key_auth" in config_ssh:
    print("Authentification par clé activée")

# Itération
for cle, valeur in config_ssh.items():
    print(f"  {cle} = {valeur}")
```

### 🛠️ Atelier Pratique — Lecture d'un Script de Configuration

```python
#!/usr/bin/env python3
"""Parseur de configuration SSH"""

def lire_config(fichier_config):
    """Analyse un fichier de configuration SSH et retourne un dict."""
    parametres = {}
    try:
        with open(fichier_config, "r") as f:
            for ligne in f:
                ligne = ligne.strip()
                if not ligne or ligne.startswith("#"):
                    continue  # Ignore les commentaires et lignes vides
                parties = ligne.split(None, 1)
                if len(parties) == 2:
                    cle, valeur = parties
                    parametres[cle.lower()] = valeur
    except FileNotFoundError:
        print(f"Erreur : {fichier_config} introuvable")
    return parametres

# Usage
config = lire_config("/etc/ssh/sshd_config")
port = config.get("port", "22")
print(f"SSH écoute sur le port : {port}")
```

**Questions de lecture :**
1. Que fait `ligne.strip()` ?
2. Pourquoi le bloc `try/except` est-il là ?
3. Que retourne la fonction si le fichier n'existe pas ?
4. Que signifie `split(None, 1)` ?

---

## 3) Module — Compréhension des Structures Complexes (2h)

### 📖 Narration/Intuition

Les analystes en cybersécurité rencontrent souvent du code Python condensé : list comprehensions, expressions ternaires, lambdas. Ces syntaxes courtes doivent être déchiffrées rapidement.

### 🔍 Anatomie Technique

**List comprehensions — syntaxe condensée :**

```python
# Syntaxe classique
ports_ouverts = []
for port in range(1, 1025):
    if port in [22, 80, 443, 8080]:
        ports_ouverts.append(port)

# Équivalent en list comprehension (plus compact)
ports_ouverts = [port for port in range(1, 1025) if port in [22, 80, 443, 8080]]

# Lire comme : "port POUR port DANS plage SI condition"
```

**Expressions ternaires :**

```python
# Syntaxe : valeur_si_vrai if condition else valeur_si_faux
score = 78
statut = "Validé" if score >= 75 else "Échoué"
print(statut)  # "Validé"

# Équivalent long :
# if score >= 75:
#     statut = "Validé"
# else:
#     statut = "Échoué"
```

**Gestion des exceptions (lecture critique) :**

```python
import socket

def tester_port(hote, port):
    """Teste si un port est ouvert sur un hôte."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        resultat = sock.connect_ex((hote, port))  # 0 = succès
        sock.close()
        return resultat == 0
    except socket.gaierror:
        print(f"Erreur : impossible de résoudre {hote}")
        return False
    except socket.timeout:
        print(f"Timeout : {hote}:{port} ne répond pas")
        return False

# Usage
if tester_port("192.168.1.1", 22):
    print("SSH disponible")
```

**Comprendre ce code :**
- `socket.AF_INET` = IPv4 | `socket.SOCK_STREAM` = TCP
- `connect_ex()` retourne `0` si connexion réussie, sinon un code d'erreur
- `gaierror` = erreur de résolution DNS

### 🚑 Terrain — Anti-Patterns Dangereux à Repérer

```python
# ❌ DANGEREUX : eval() exécute du code arbitraire
commande = input("Entrez une commande : ")
eval(commande)  # Injection de code possible !

# ❌ DANGEREUX : exec() avec entrée utilisateur
exec(input("Code Python : "))

# ❌ DANGEREUX : subprocess sans validation
import subprocess
cmd = input("Commande : ")
subprocess.run(cmd, shell=True)  # Injection de commande OS !

# ✅ SÉCURISÉ : subprocess avec liste (pas de shell=True)
subprocess.run(["ls", "-la", "/tmp"], capture_output=True)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PEP** | Python Enhancement Proposal — document de standardisation du langage Python |
| **CLI** | Command-Line Interface — interface en ligne de commande |
| **API** | Application Programming Interface — interface de programmation |
| **OOP** | Object-Oriented Programming — programmation orientée objet |
| **REPL** | Read-Eval-Print Loop — interpréteur interactif Python (`python3`) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 — Analyse de code :** Lisez le script suivant et décrivez en français ce qu'il fait, étape par étape :

```python
import os
import json

def collecter_info_systeme():
    info = {
        "hostname": os.uname().nodename,
        "os": os.uname().sysname,
        "utilisateurs": [],
    }
    
    try:
        with open("/etc/passwd", "r") as f:
            for ligne in f:
                if not ligne.startswith("#"):
                    parties = ligne.strip().split(":")
                    if len(parties) >= 7 and parties[6] not in ["/usr/sbin/nologin", "/bin/false"]:
                        info["utilisateurs"].append({
                            "nom": parties[0],
                            "uid": int(parties[2]),
                            "shell": parties[6]
                        })
    except PermissionError:
        info["erreur"] = "Accès refusé à /etc/passwd"
    
    return json.dumps(info, indent=2)

print(collecter_info_systeme())
```

**Corrigé :**
Ce script collecte des informations système :
1. Récupère le nom d'hôte et l'OS via `os.uname()`
2. Lit `/etc/passwd` pour lister les utilisateurs ACTIFS (shell valide, pas `/nologin`)
3. Pour chaque utilisateur actif : enregistre nom, UID, shell
4. En cas d'accès refusé : ajoute un message d'erreur
5. Retourne tout en JSON formaté avec indentation

**Exercice 2 — Adaptation :** Modifiez le script ci-dessus pour ne lister que les utilisateurs avec un UID supérieur à 1000 (comptes humains, pas système).

**Corrigé :**
Ajouter la condition `and int(parties[2]) > 1000` dans le `if` de la boucle.

---

## ❓ Banque de Questions & Test du Jour

**Question 1 :** En Python, que retourne `{"a": 1, "b": 2}.get("c", 0)` ?
- A) Une exception `KeyError`
- B) `None`
- C) `0`
- D) `False`

**Réponse : C** — `.get(clé, valeur_défaut)` retourne la valeur par défaut si la clé est absente.

---

**Question 2 :** Dans le code `if not ligne.startswith("#"):`, à quoi sert cette condition ?
- A) À ignorer les lignes commençant par `#` (commentaires)
- B) À rechercher les lignes avec un `#`
- C) À compter les caractères `#`
- D) À supprimer les `#` de la ligne

**Réponse : A** — `not ligne.startswith("#")` est `True` quand la ligne NE commence PAS par `#`.

---

**Question 3 :** Quelle est la différence entre `=` et `==` en Python ?
- A) Aucune, ce sont des synonymes
- B) `=` est l'affectation, `==` est la comparaison d'égalité
- C) `=` compare, `==` affecte
- D) `==` affecte et vérifie en même temps

**Réponse : B** — `x = 5` affecte la valeur 5 à x. `x == 5` vérifie si x vaut 5, retourne `True` ou `False`.

---

**Question 4 :** Que fait `subprocess.run(cmd, shell=True)` avec une entrée utilisateur non validée ?
- A) Exécute la commande de façon sécurisée
- B) Filtre automatiquement les commandes dangereuses
- C) Crée une vulnérabilité d'injection de commande OS
- D) Demande une confirmation avant d'exécuter

**Réponse : C** — `shell=True` avec entrée non validée permet d'injecter des commandes OS (ex: `; rm -rf /`).

---

**Question 5 :** Quelle lecture fait-on de `ports = [p for p in range(1,1025) if p % 2 == 0]` ?
- A) Tous les ports de 1 à 1024
- B) Les ports pairs de 1 à 1024
- C) Les ports impairs de 1 à 1024
- D) Les ports divisibles par 1025

**Réponse : B** — `p % 2 == 0` est vrai pour les nombres pairs (reste de division par 2 = 0).

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
