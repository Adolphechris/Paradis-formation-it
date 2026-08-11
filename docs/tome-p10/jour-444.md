# TOME P10 — DFIR & Reverse Engineering — Jour 444 (6h) : Forensique Réseau & Analyse de Trafic (Wireshark Avancé, Zeek IDS, Suricata & Network Threat Hunting)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser **Wireshark / TShark** pour l'analyse approfondie de captures réseau en contexte DFIR
> - Implémenter **Zeek (Bro)** pour la génération de logs réseau structurés (conn, dns, http, ssl, files)
> - Configurer **Suricata** en mode IDS/NSM avec règles Emerging Threats pour la détection de C2 et exfiltration
> - Conduire un **Network Threat Hunt** sur une capture PCAP pour identifier un incident (C2 Beacon, DNS Tunneling, Data Exfiltration)
>
> **Compétences visées :** `SEC-05` (A) — Network Forensics, `SEC-04` (A) — Threat Hunting

---

## Module 1 — Wireshark Avancé & TShark pour le DFIR (2h)

### 📖 Intuition & Narration

Le réseau est l'appareil photo de l'infrastructure : tout ce qui circule y est capturé si on le configure correctement. Lors d'un incident, les captures PCAP sont souvent les preuves les plus irréfutables — elles montrent exactement ce qui a transité, quand, et comment. Un attaquant peut effacer des logs, mais s'il n'a pas compromis les points de capture réseau, ses communications sont conservées.

### 🔍 Anatomie Technique — Filtres Wireshark pour DFIR

```
FILTRES WIRESHARK DFIR — RÉFÉRENCE RAPIDE

  ══════════════════ DÉTECTION DE BEACONS C2 ═══════════════════
  # Connexions HTTPS régulières (intervalle constant = beacon)
  (ip.dst == 185.220.101.47) && (tcp.port == 443)
  
  # HTTP suspicieux sans User-Agent standard
  http && !(http.user_agent contains "Mozilla")

  ══════════════════ DÉTECTION DNS TUNNELING ════════════════════
  # Requêtes DNS anormalement longues (>50 chars)
  dns && (dns.qry.name.len > 50)
  
  # Requêtes DNS de type TXT (utilisées pour tunneling)
  dns.qry.type == 16

  ══════════════════ EXFILTRATION DE DONNÉES ═══════════════════
  # Gros transferts POST HTTP (upload suspect)
  http.request.method == "POST" && (http.content_length > 100000)
  
  # Trafic FTP non chiffré contenant des credentials
  ftp.request.command == "PASS"

  ══════════════════ ANALYSE TLS/HTTPS ════════════════════════
  # Handshakes TLS vers des IPs suspectes
  tls.handshake.type == 1
  
  # JA3 Hash TLS Client Hello (fingerprinting malware)
  tls.handshake.ja3

  ══════════════════ MOUVEMENTS LATÉRAUX ══════════════════════
  # SMB vers nouvelles IP (propagation PsExec / WannaCry)
  smb2.cmd == 5  # SMB2 Create (tentative d'exécution distante)
  
  # Scan de ports (SYN sans SYN-ACK)
  tcp.flags.syn == 1 && tcp.flags.ack == 0
```

### 🛠️ Atelier Pratique — TShark CLI pour Automatisation DFIR

```bash
# ═══════════════════════════════════════════════════════════
# TSHARK — Analyse PCAP en ligne de commande (automatisable)
# ═══════════════════════════════════════════════════════════

PCAP="incident_capture.pcap"

# 1. Statistiques globales de la capture
tshark -r $PCAP -q -z io,stat,0

# 2. Top 20 conversations IP (potentiel C2 ou exfiltration)
tshark -r $PCAP -q -z conv,ip | head -25

# 3. Extraire toutes les requêtes DNS
tshark -r $PCAP -Y dns -T fields \
    -e frame.time \
    -e ip.src \
    -e dns.qry.name \
    -e dns.qry.type \
    -e dns.a \
    > /tmp/dns_queries.csv

# 4. Détecter DNS Tunneling — sous-domaines anormalement longs
tshark -r $PCAP -Y "dns.qry.name.len > 50" -T fields \
    -e frame.time \
    -e ip.src \
    -e dns.qry.name

# 5. Extraire les fichiers transférés via HTTP (malware droppers)
tshark -r $PCAP --export-objects http,/tmp/http_objects/

# 6. Analyser les certificats TLS pour trouver des C2
tshark -r $PCAP -Y "tls.handshake.type == 11" -T fields \
    -e ip.dst \
    -e tls.handshake.certificate \
    | sort -u

# 7. Calculer JA3 hash pour fingerprinting malware
# JA3 = hash MD5 du TLS ClientHello (version, ciphers, extensions)
tshark -r $PCAP -Y "tls.handshake.type == 1" -T fields \
    -e ip.src \
    -e tls.handshake.ja3 \
    | sort | uniq -c | sort -rn | head -20
# Comparer les JA3 hashes contre https://ja3er.com/

# 8. Identifier des beacons par intervalle de connexion régulier
tshark -r $PCAP -Y "ip.dst == 185.220.101.47" -T fields \
    -e frame.time_epoch \
    | awk 'NR>1{diff=$1-prev; printf "%.2f sec between packets\n", diff} {prev=$1}'
```

---

## Module 2 — Zeek (Bro) : Network Security Monitoring (2h)

### 📖 Intuition & Narration

Wireshark montre les paquets bruts — Zeek les comprend. Là où Wireshark affiche 10 000 paquets d'une conversation HTTP, Zeek génère un log `http.log` structuré avec la méthode, l'URL, le user-agent, la taille de réponse et le status code. Zeek transforme le réseau en **données analysables** par un SIEM.

### 🔍 Anatomie Technique — Logs Zeek

```
LOGS ZEEK — TYPES ET CHAMPS CLÉS

  conn.log      : TOUTES les connexions (TCP/UDP/ICMP)
  ├── ts, uid, id.orig_h, id.orig_p, id.resp_h, id.resp_p
  ├── proto, service, duration, orig_bytes, resp_bytes
  └── conn_state (S1=connected, SF=full close, REJ=rejected)

  dns.log       : Requêtes DNS
  ├── query (nom demandé), qtype_name (A/AAAA/MX/TXT)
  └── answers, TTL

  http.log      : Trafic HTTP
  ├── method, host, uri, user_agent
  └── status_code, request_body_len, response_body_len

  ssl.log       : TLS/HTTPS
  ├── server_name (SNI), cipher, version
  └── cert_chain_fuids, validation_status

  files.log     : Fichiers transférés
  ├── filename, mime_type, sha256
  └── source (HTTP/SMTP/FTP), total_bytes

  x509.log      : Certificats TLS extraits
  ├── certificate.subject, certificate.issuer
  ├── certificate.not_valid_before, certificate.not_valid_after
  └── certificate.key_type, certificate.key_length
```

### 🛠️ Atelier Pratique — Zeek Analyse PCAP

```bash
# ═══════════════════════════════════════════════════════════
# ZEEK — Network Security Monitoring
# ═══════════════════════════════════════════════════════════

# Installation Zeek (Ubuntu/Debian)
apt-get install zeek

# Analyser un PCAP avec Zeek (génère tous les logs automatiquement)
cd /tmp/zeek_analysis
zeek -C -r /evidence/incident_capture.pcap LogAscii::use_json=T

# Les logs sont générés dans le répertoire courant :
ls *.log

# ── ANALYSE DNS TUNNELING ────────────────────────────────
# Requêtes avec sous-domaines longs (> 50 chars)
zeek-cut query answers < dns.log | \
    awk '{if(length($1) > 50) print $0}' | head -20

# Compter les requêtes DNS par domaine parent (DGA Detection)
zeek-cut query < dns.log | \
    awk -F'.' '{print $(NF-1)"."$NF}' | \
    sort | uniq -c | sort -rn | head -20

# ── ANALYSE BEACON C2 ────────────────────────────────────
# Connexions fréquentes vers une même IP (intervalle régulier = beacon)
zeek-cut ts id.resp_h id.resp_p orig_bytes resp_bytes < conn.log | \
    sort -k2 | \
    awk '$2=="185.220.101.47" {print $0}' | head -30

# ── DÉTECTION DONNÉES EXFILTRÉES ─────────────────────────
# Top 20 connexions sortantes par volume de données (orig_bytes)
zeek-cut id.resp_h id.resp_p orig_bytes < conn.log | \
    sort -k3 -rn | head -20

# ── ANALYSE CERTIFICATS TLS SUSPECTS ─────────────────────
# Certificats auto-signés (issuer == subject) → indicateur C2
zeek-cut certificate.subject certificate.issuer < x509.log | \
    awk '$1 == $2 {print "SELF-SIGNED:", $1}' | sort -u

# ── THREAT HUNTING : DGA DETECTION ───────────────────────
# Algorithme DGA génère des domaines à haute entropie
# Calcul d'entropie via Python
python3 - << 'EOF'
import math, collections
import sys

def entropy(domain):
    counts = collections.Counter(domain)
    length = len(domain)
    return -sum((c/length) * math.log2(c/length) for c in counts.values())

# Lire dns.log Zeek (format JSON avec LogAscii::use_json=T)
import json
with open('dns.log') as f:
    for line in f:
        try:
            entry = json.loads(line)
            query = entry.get('query', '')
            ent = entropy(query.split('.')[0])  # Entropie du sous-domaine
            if ent > 3.5 and len(query) > 20:
                print(f"[HIGH ENTROPY DGA?] {query} (entropy={ent:.2f})")
        except:
            pass
EOF
```

---

## Module 3 — Suricata IDS & Network Threat Hunting (1h30)

### 🛠️ Atelier Pratique — Suricata en Mode NSM

```bash
# ═══════════════════════════════════════════════════════════
# SURICATA — IDS/NSM avec règles Emerging Threats
# ═══════════════════════════════════════════════════════════

# Installation et configuration
apt-get install suricata
suricata-update  # Télécharge les règles Emerging Threats (ET)

# Analyse d'un PCAP en mode offline
suricata -c /etc/suricata/suricata.yaml \
    -r /evidence/incident_capture.pcap \
    -l /tmp/suricata_logs/

# Analyser les alertes générées
cat /tmp/suricata_logs/fast.log | head -30

# Format JSON (eve.json) — plus riche
jq '.[] | select(.event_type == "alert")' /tmp/suricata_logs/eve.json | \
    jq '{timestamp: .timestamp, src_ip: .src_ip, dest_ip: .dest_ip,
         signature: .alert.signature, category: .alert.category,
         severity: .alert.severity}' | head -50

# Filtrer alertes severity 1 (critique) uniquement
jq 'select(.event_type=="alert" and .alert.severity==1)' \
    /tmp/suricata_logs/eve.json | \
    jq '{ts: .timestamp, src: .src_ip, sig: .alert.signature}'

# ═══════════════════════════════════════════════════════════
# RÈGLE SURICATA PERSONNALISÉE — Détection Cobalt Strike Beacon
# ═══════════════════════════════════════════════════════════
cat >> /etc/suricata/rules/local.rules << 'RULE'
# Détection Cobalt Strike HTTP Beacon (pattern User-Agent)
alert http $HOME_NET any -> $EXTERNAL_NET any (
    msg:"ET MALWARE Cobalt Strike Beacon Checkin";
    flow:established,to_server;
    http.user_agent;
    content:"Mozilla/5.0 (compatible; MSIE 9.0";
    threshold:type both, track by_src, count 3, seconds 300;
    classtype:trojan-activity;
    sid:9000001;
    rev:1;
)

# Détection DNS Tunneling par longueur
alert dns any any -> any 53 (
    msg:"PARADIS DNS Tunneling — Long Subdomain";
    dns.query;
    pcre:"/[a-z0-9]{50,}/";
    threshold:type both, track by_src, count 10, seconds 60;
    classtype:bad-unknown;
    sid:9000002;
    rev:1;
)
RULE

# Recharger les règles
suricatasc -c reload-rules
```

### 🚑 Terrain — Retour d'Expérience

**Cas : DNS Tunneling détecté via Zeek dans une entreprise pharmaceutique (2024)**

Un analyst Threat Hunter constate une anomalie dans `dns.log` Zeek : un poste interne (192.168.10.45) émet 3 000 requêtes DNS/heure vers `*.data-transfer.pharmaCorp-update[.]com` avec des sous-domaines encodés en Base64 de 60-80 caractères. Le serveur DNS répond avec des enregistrements TXT contenant du texte chiffré.

**Diagnostic :** DNS Tunneling via l'outil `iodine`. L'attaquant exfiltre 2 Mo/heure de données sensibles (formules de recherche) en dissimulant le trafic dans des requêtes DNS — trafic non bloqué par le pare-feu (port 53 UDP toujours ouvert).

**Réponse :** Blocage immédiat du domaine DGA au niveau du resolver interne + déploiement règle Suricata DNS Tunneling + analyse forensique du poste compromis.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NSM** | Network Security Monitoring — Collecte et analyse continue du trafic réseau pour la détection des menaces |
| **JA3** | John Althouse 3 — Méthode de fingerprinting TLS Client Hello par hash MD5 des paramètres de négociation |
| **SNI** | Server Name Indication — Extension TLS indiquant le domaine cible dans le Client Hello |
| **C2** | Command & Control — Serveur de contrôle utilisé par un attaquant pour piloter un malware |
| **DGA** | Domain Generation Algorithm — Algorithme génèrant des milliers de domaines pour éviter la détection |

---

## Exercices Pratiques

### Exercice 1 — Identification d'un Beacon C2

Dans une capture Zeek `conn.log`, vous observez une connexion vers 203.0.113.42:443 toutes les 60 secondes avec 300 bytes envoyés et 50 bytes reçus. Sur 8 heures, 480 connexions identiques.

**Question :** Quel pattern indique un beacon C2 ? Quelles 3 actions de Threat Hunting effectuez-vous ?

**Corrigé guidé :**
- **Pattern :** Intervalles réguliers (60s), trafic bi-directionnel asymétrique (300→50 bytes), persistance sur 8h = **Beacon Sleep pattern** caractéristique de Cobalt Strike/Metasploit.
- **Actions :** 1) JA3 fingerprinting du TLS ClientHello pour identifier le framework C2. 2) Analyse du certificat TLS (auto-signé ? durée de vie courte ?). 3) Corrélation avec logs EDR — quel processus sur le poste établit ces connexions ?

### Exercice 2 — Règle Suricata

Écrivez une règle Suricata qui détecte toute requête HTTP POST vers un domaine externe contenant plus de 50 000 bytes dans le body (exfiltration).

**Corrigé guidé :**
```
alert http $HOME_NET any -> $EXTERNAL_NET 80 (
    msg:"PARADIS Large HTTP POST Exfiltration";
    flow:established,to_server;
    http.method; content:"POST";
    http.request_body; rawbytes; byte_test:4,>,50000,0,relative;
    classtype:policy-violation;
    sid:9000010;
    rev:1;
)
```

---

## Banque QCM — 5 Questions

**Q1.** Le JA3 Hash TLS est utile en forensique réseau car :

- A) Il déchiffre le contenu des sessions TLS
- B) Il fingerprint le client TLS indépendamment de l'IP ou du domaine, permettant d'identifier des malwares ✅
- C) Il révèle le mot de passe utilisé dans la session TLS
- D) Il identifie le serveur TLS et son certificat

**Q2.** Un domaine DNS avec une entropie de Shannon > 3.5 sur son sous-domaine est suspect car :

- A) Les domaines légitimes ont toujours une entropie inférieure à 1.0
- B) Les algorithmes DGA génèrent des chaînes de caractères aléatoires à haute entropie ✅
- C) Une haute entropie indique un certificat TLS expiré
- D) Les serveurs DNS refusent les domaines à haute entropie

**Q3.** Zeek (anciennement Bro) se différencie de Suricata car :

- A) Zeek est un IPS qui bloque le trafic en temps réel
- B) Zeek génère des logs structurés analytiques, tandis que Suricata génère des alertes basées sur des signatures ✅
- C) Zeek est exclusivement pour Linux, Suricata pour Windows
- D) Zeek ne peut pas analyser du TLS chiffré

**Q4.** Dans `conn.log` Zeek, un `conn_state` de valeur `S0` signifie :

- A) Connexion établie et fermée normalement (SYN-SYNACK-FIN)
- B) Connexion réinitialisée par le serveur (RST)
- C) Tentative de connexion sans réponse (SYN sans SYN-ACK) — scan ou hôte mort ✅
- D) Connexion UDP établie

**Q5.** La commande TShark `--export-objects http,/tmp/` permet de :

- A) Exporter les métadonnées des requêtes HTTP en JSON
- B) Reconstruire et sauvegarder tous les fichiers transférés via HTTP depuis un PCAP ✅
- C) Générer un rapport HTML de l'analyse du PCAP
- D) Exporter la capture PCAP au format CSV

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
