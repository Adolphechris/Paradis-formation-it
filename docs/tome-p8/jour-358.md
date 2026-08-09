# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 358 (6h) : NDR & Cyber Deception — Network Detection & Response (Zeek, Suricata, Beaconing Detection, Honeypots & Canary Tokens)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse du trafic réseau défensif (**Network Detection & Response - NDR**) et les techniques de **Cyber Deception** (Leurre Cyber) : déployer **Zeek (Bro)** et **Suricata** pour la capture et le parsing des flux réseau, détecter les canaux de **Beaconing C2** et d'exfiltration de données (DNS Tunneling, ICMP Tunneling, HTTPS Jitter), et déployer des **Honeypots** et des **Canary Tokens** stratégiques pour intercepter les mouvements latéraux des attaquants.
>
> **Compétences visées :** `NDR-01` (A) — Zeek/Suricata Network Forensics & C2 Beaconing Detection | `NDR-02` (A) — Cyber Deception Engineering (Honeypots, Honeytokens & Canary Alerting)

---

## 1) Module — Network Detection & Response (Zeek & Suricata) (2h)

### 📖 Narration/Intuition

L'EDR protège les endpoints, mais il ne voit pas le trafic réseau brut entre les équipements non agents (IoT, équipements réseau, BYOD). Le **NDR (Network Detection & Response)** s'appuie sur la capture des paquets (SPAN/TAP port) pour analyser le comportement des flux au niveau 3 à 7 du modèle OSI.

```
       [ SPAN / TAP Port Miroir du Switch Coeur ]
                         │
                         ▼ (Trafic Réseau Brut PCAP)
┌─────────────────────────────────────────────────────────────┐
│ NDR ENGINE (Zeek + Suricata IDS)                            │
│  - Zeek : Métadonnées structurées (http.log, dns.log, conn.log)│
│  - Suricata : Inspection de contenu & Règles Signature NIDS │
└────────────────────────┬────────────────────────────────────┘
                         │ (Détection Anomale & Beaconing)
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
[ SIEM Correlation ]  [ Honeypot Alert ] [ Auto-Block Firewall ]
```

#### Détection du C2 Beaconing (Signaux Périodiques)

Les implants malveillants recontactent leur serveur Command & Control (C2) à intervalles réguliers. Pour déjouer les détections simples, les attaquants ajoutent du **Jitter** (variation aléatoire). L'analyse statistique NDR calcule la variance et l'écart-type de l'intervalle de temps ($\Delta t$) entre les connexions :

$$\text{Variance } (\sigma^2) = \frac{1}{N} \sum_{i=1}^{N} (\Delta t_i - \mu)^2$$

*Si $\sigma^2$ est très faible $\rightarrow$ Fréquence fixe = Beaconing C2 Détecté !*

---

## 2) Module — Outillage NDR Engine & Honeytoken Framework (`ndr_deception_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import math
from datetime import datetime, timezone
from typing import List, Dict

class NDRDeceptionEngine:
    """
    Moteur NDR de détection de Beaconing C2 et de gestion des Honeytokens/Canary Tokens.
    """

    def __init__(self, honeypot_ips: set):
        self.honeypot_ips = honeypot_ips
        self.connection_logs: Dict[str, List[float]] = {} # Key: "src_ip->dest_ip"
        self.alerts: List[dict] = []

    def log_network_connection(self, src_ip: str, dest_ip: str, dest_port: int, timestamp_epoch: float) -> dict:
        """Enregistre une connexion réseau (Métadonnée type Zeek conn.log)."""
        pair_key = f"{src_ip}->{dest_ip}:{dest_port}"
        
        # 1. Test de Cyber Deception : Connexion vers une IP Honeypot ?
        if dest_ip in self.honeypot_ips:
            self._raise_ndr_alert(
                alert_type="CYBER_DECEPTION_HONEYPOT_TRIGGERED",
                severity="CRITICAL",
                source=src_ip,
                details=f"Accès non autorisé au leurre Honeypot {dest_ip}:{dest_port} !"
            )

        # 2. Enregistrement pour l'analyse de Beaconing
        if pair_key not in self.connection_logs:
            self.connection_logs[pair_key] = []
        self.connection_logs[pair_key].append(timestamp_epoch)

        # Si plus de 5 connexions, analyser la régularité (Beaconing)
        if len(self.connection_logs[pair_key]) >= 5:
            self._analyze_c2_beaconing(pair_key, src_ip, dest_ip, dest_port)

        return {"status": "LOGGED", "pair": pair_key}

    def _analyze_c2_beaconing(self, pair_key: str, src_ip: str, dest_ip: str, dest_port: int):
        """Calcule la variance temporelle pour détecter un signal de Beaconing C2."""
        timestamps = self.connection_logs[pair_key]
        intervals = [timestamps[i] - timestamps[i-1] for i in range(1, len(timestamps))]

        mean_interval = sum(intervals) / len(intervals)
        variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)
        std_dev = math.sqrt(variance)

        # Si l'écart-type est inférieur à 2.0 secondes sur un intervalle moyen -> Beaconing fort !
        if std_dev < 2.0 and mean_interval > 5.0:
            self._raise_ndr_alert(
                alert_type="NDR_C2_BEACONING_DETECTED",
                severity="HIGH",
                source=src_ip,
                details=f"Signal C2 périodique détecté vers {dest_ip}:{dest_port}. Intervalle moyen: {mean_interval:.1f}s (Écart-type: {std_dev:.2f}s)"
            )

    def _raise_ndr_alert(self, alert_type: str, severity: str, source: str, details: str):
        alert = {
            "alert_id": f"NDR-ALT-{len(self.alerts)+1:04d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": alert_type,
            "severity": severity,
            "source_ip": source,
            "details": details
        }
        self.alerts.append(alert)
        print(f"[!] ALERTE NDR [{severity}] {alert_type} -> {details}")

# Démonstration du Moteur NDR & Deception
honeypots = {"10.0.99.50", "10.0.99.51"}
ndr = NDRDeceptionEngine(honeypots)

print("=== NDR & CYBER DECEPTION ENGINE DEMO ===")

# Test 1 : Attaquant qui scanne et touche un Honeypot
ndr.log_network_connection("10.0.4.15", "10.0.99.50", 445, 1723140000.0)

# Test 2 : Beaconing C2 périodique (toutes les 10 secondes avec très peu de Jitter)
base_time = 1723140000.0
for i in range(6):
    # Intervalle de ~10s (avec 0.1s de variation)
    t = base_time + (i * 10.0) + (0.1 if i % 2 == 0 else -0.1)
    ndr.log_network_connection("10.0.4.15", "185.220.101.5", 443, t)

print("\n=== ALERTES NDR SURVEILLANCE ===")
print(json.dumps(ndr.alerts, indent=2, ensure_ascii=False))
```

---

## 3) Module — Guide de Déploiement des Canary Tokens (2h)

```markdown
# DEPLOYMENT GUIDE — CANARY TOKENS & HONEYTOKENS (CYBER DECEPTION)

## 1. Principe des Canary Tokens
Un **Canary Token** (ou Honeytoken) est un leurre numérique inactif (URL, clé AWS, document Word, compte Active Directory) placé dans l'environnement. Aucune activité légitime ne doit jamais toucher ce leurre. Tout accès déclenche une **alerte immédiate (0% de Faux Positifs !)**.

## 2. Types de Leurres à Déployer dans l'Entreprise

| Type de Leurre | Emplacement | Déclencheur | Alerte SOC |
|:---|:---|:---|:---|
| **Honey Credential** | Mémoire LSASS / GPP / Web Browser | Tentative de connexion / Password Spray | Alerte PrivEsc Immédiate |
| **Canary Document** | Partage réseau confidentiel (`Salaires_2026.docx`) | Ouverture du document (Web Bug/Macro) | Alerte Data Exfiltration |
| **AWS Honeykey** | Fichier `.aws/credentials` sur un poste | Utilisation de l'API AWS avec la clé | Alerte Cloud Compromise |
| **Honeypot Service** | IP interne non attribuée (Port 445/3389) | Scan de port / Mouvement latéral | Alerte Lateral Movement |

## 3. Exemple de Règle Suricata IDS pour Détecter le DNS Tunneling
```suricata
alert dns $HOME_NET any -> $EXTERNAL_NET any (msg:"NDR - Potential DNS Tunneling High Subdomain Length"; dns.query; re:"^[a-zA-Z0-9]{30,}\."; sid:2026001; rev:1;)
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NDR** | Network Detection and Response — Analyse comportementale et inspection du trafic réseau en temps réel |
| **Honeypot** | Leurre informatique conçu pour attirer et piéger les attaquants |
| **Canary Token** | Jeton ou artefact leurre qui déclenche une alerte instantanée dès qu'il est consulté ou utilisé |
| **Jitter** | Variation temporelle introduite artificiellement par un malware pour masquer son intervalle de Beaconing |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est l'avantage majeur des **Canary Tokens (Honeytokens)** en termes de triage dans le SOC ?
- A) Ils génèrent un taux de Faux Positifs de quasiment 0%, car aucune activité légitime n'a de raison d'accéder à un artefact leurre
- B) Ils remplacent le pare-feu
- C) Ils chiffrent les sauvegardes
- D) Ils diminuent la bande passante

**Réponse : A**

**Q2 :** Comment l'analyse statistique **NDR** parvient-elle à détecter un canal de **C2 Beaconing** obfusqué ?
- A) En calculant la régularité et la faible variance statistique ($\sigma^2$) des intervalles de temps entre les connexions réseau répétées vers une même destination
- B) En lisant le code source du serveur distant
- C) En bloquant toutes les adresses IP du pays
- D) En scannant le disque dur local

**Réponse : A**

**Q3 :** Quelle est la différence entre l'outil **Zeek (Bro)** et un IDS classique comme **Suricata** ?
- A) Suricata est principalement un moteur de recherche de signatures d'attaque (NIDS), tandis que Zeek est un analyseur de protocole générant des métadonnées de trafic réseau structurées (logs HTTP, DNS, SSL)
- B) Zeek ne fonctionne que sur Windows
- C) Suricata est réservé au Wi-Fi
- D) Il n'y a aucune différence

**Réponse : A**

**Q4 :** Dans une attaque par **DNS Tunneling**, quel comportement réseau trahit l'exfiltration de données ?
- A) L'émission de très nombreuses requêtes DNS vers des sous-domaines anormalement longs et encodés (ex: `a8f912b3c...attacker.com`)
- B) L'absence complète de trafic DNS
- C) L'utilisation de paquets ICMP de 64 octets
- D) L'affichage d'une page 404

**Réponse : A**

**Q5 :** Qu'est-ce qu'un **Honey Credential** dans le contexte Active Directory ?
- A) Un compte d'utilisateur factice avec des privilèges attractifs (ex: `admin_backup`) surveillé par le SOC : toute tentative de connexion sur ce compte signale un Password Spraying ou un Kerberoasting
- B) Le vrai mot de passe du CISO
- C) Un certificat expiré
- D) Une clé USB vierge

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
