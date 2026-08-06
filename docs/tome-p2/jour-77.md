# TOME P2 — Réseaux & Télécoms — Jour 77 (6h) : SIEM & Gestion des Journaux de Sécurité

> [!NOTE]
> **Objectif du jour :** Déployer et opérer un SIEM (Security Information and Event Management) : collecte centralisée des logs (rsyslog, syslog-ng, Filebeat), normalisation, corrélation d'événements, création de règles d'alerte et investigation d'incidents sur la pile ELK (Elasticsearch, Logstash, Kibana) ou Grafana Loki.
>
> **Compétences visées :** `POL-03` (A) — Journalisation & SIEM | `SEC-06` (A) — Détection et Réponse aux Incidents

---

## 1) Module — Architecture de Journalisation & Collecte Centralisée (2h)

### 📖 Narration/Intuition

Sans journalisation centralisée, répondre à un incident de sécurité revient à enquêter sur un crime sans témoin et sans caméra de surveillance. Les logs dispersés sur 50 serveurs sont impossibles à corréler manuellement. Un **SIEM centralisé** rassemble tous les événements en un seul endroit, les normalise et permet de détecter des patterns d'attaque invisibles sur un seul équipement.

**Dans un contexte BCC** : un attaquant qui teste des mots de passe (brute force) sur 10 serveurs différents, à raison de 2 tentatives par serveur, passe inaperçu sur chaque serveur individuellement. Le SIEM voit les 20 tentatives et déclenche une alerte.

### 🔍 Anatomie Technique

**Architecture de collecte des logs (stack ELK) :**

```
Sources de logs (tous les équipements)
├── Serveurs Linux   → /var/log/auth.log, /var/log/syslog
├── Pare-feux        → logs nftables (via rsyslog)
├── Nginx/Apache     → access.log, error.log
├── Applications     → journald, JSON structured logs
├── Switches/Routeurs → Syslog UDP/TCP 514
└── Suricata/OSSEC   → JSON alerts

         │ Syslog UDP/TCP 514 ou Beats (TCP 5044)
         ▼
┌─────────────────────────────────────────────────────┐
│              COLLECTE & TRANSPORT                    │
│  rsyslog / Filebeat / Fluentd / Vector              │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              TRAITEMENT & NORMALISATION              │
│  Logstash (parsing, enrichissement, filtres)        │
│  ou                                                 │
│  Vector Remap Language (VRL)                        │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              STOCKAGE & INDEXATION                   │
│  Elasticsearch (indexe et cherche en temps réel)    │
│  ou Grafana Loki (pour les logs non structurés)     │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              VISUALISATION & ALERTES                 │
│  Kibana (dashboards, KQL queries, alertes)          │
│  ou Grafana (avec Loki + Alertmanager)              │
└─────────────────────────────────────────────────────┘
```

**Configuration rsyslog (collecte centralisée) :**

```bash
# Sur le SERVEUR SIEM (récepteur)
cat >> /etc/rsyslog.conf << 'EOF'
# Recevoir les logs via UDP et TCP (port 514)
module(load="imudp")
input(type="imudp" port="514")

module(load="imtcp")
input(type="imtcp" port="514")

# Template de stockage : un fichier par hôte
$template DynamicFile,"/var/log/remote/%HOSTNAME%/%$YEAR%-%$MONTH%-%$DAY%.log"
*.* ?DynamicFile
& stop
EOF

systemctl restart rsyslog

# Sur les CLIENTS (tous les serveurs à surveiller)
cat >> /etc/rsyslog.conf << 'EOF'
# Envoyer tous les logs vers le SIEM central
*.* @10.0.10.100:514    # UDP (simple)
*.* @@10.0.10.100:514   # TCP (fiable, avec acquittement)

# Envoyer seulement les logs auth et kern
auth,authpriv.* @@10.0.10.100:514
kern.* @@10.0.10.100:514
EOF
systemctl restart rsyslog
```

**Filebeat — Collecte structurée de logs applicatifs :**

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
  # Logs nginx
  - type: filestream
    id: nginx-access
    paths:
      - /var/log/nginx/access.log
    parsers:
      - ndjson:
          target: "nginx"
    tags: ["nginx", "web"]
  
  # Logs d'authentification SSH
  - type: filestream
    id: auth-logs
    paths:
      - /var/log/auth.log
      - /var/log/secure
    tags: ["auth", "linux"]
  
  # Logs Suricata (alertes IDS/IPS)
  - type: filestream
    id: suricata-eve
    paths:
      - /var/log/suricata/eve.json
    parsers:
      - ndjson:
          target: ""
    tags: ["suricata", "ids"]

# Enrichissement : ajouter l'hostname et IP de la source
processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~

# Envoi vers Elasticsearch
output.elasticsearch:
  hosts: ["https://10.0.10.200:9200"]
  username: "filebeat_writer"
  password: "${FILEBEAT_PASSWORD}"
  ssl.certificate_authorities: ["/etc/filebeat/certs/ca.crt"]
  index: "bcc-logs-%{+yyyy.MM.dd}"
```

---

## 2) Module — Logstash : Normalisation & Enrichissement des Logs (2h)

### 📖 Narration/Intuition

Les logs arrivent dans des formats hétérogènes : texte brut (auth.log), JSON (application), CEF (Cisco), Syslog RFC 5424... Logstash normalise tous ces formats en un schéma commun, enrichit les événements (géolocalisation d'IP, résolution DNS), et les indexe dans Elasticsearch.

### 🔍 Anatomie Technique

**Pipeline Logstash — Parsing des logs SSH et nftables :**

```ruby
# /etc/logstash/conf.d/bcc-pipeline.conf

input {
  # Recevoir depuis Filebeat
  beats {
    port => 5044
    ssl_enabled => true
    ssl_certificate => "/etc/logstash/certs/server.crt"
    ssl_key => "/etc/logstash/certs/server.key"
  }
  
  # Recevoir via Syslog (équipements réseau)
  syslog {
    port => 5514
    type => "syslog"
  }
}

filter {
  # ─── Parsing des logs SSH (auth.log) ─────────────────────────────────────
  if "auth" in [tags] {
    grok {
      match => {
        "message" => [
          # Tentative SSH réussie
          "%{SYSLOGTIMESTAMP:timestamp} %{HOSTNAME:host} sshd\[%{NUMBER:pid}\]: Accepted %{WORD:auth_method} for %{USERNAME:user} from %{IP:src_ip} port %{NUMBER:src_port}",
          # Tentative SSH échouée
          "%{SYSLOGTIMESTAMP:timestamp} %{HOSTNAME:host} sshd\[%{NUMBER:pid}\]: Failed %{WORD:auth_method} for %{USERNAME:user} from %{IP:src_ip} port %{NUMBER:src_port}",
          # Utilisateur invalide
          "%{SYSLOGTIMESTAMP:timestamp} %{HOSTNAME:host} sshd\[%{NUMBER:pid}\]: Invalid user %{USERNAME:user} from %{IP:src_ip}"
        ]
      }
    }
    
    # Catégoriser l'événement
    if "Failed" in [message] or "Invalid user" in [message] {
      mutate { add_field => { "event_type" => "ssh_failure" "severity" => "medium" } }
    } else if "Accepted" in [message] {
      mutate { add_field => { "event_type" => "ssh_success" "severity" => "info" } }
    }
    
    # Géolocalisation de l'IP source
    geoip {
      source => "src_ip"
      target => "geoip"
    }
  }
  
  # ─── Parsing des alertes Suricata ────────────────────────────────────────
  if "suricata" in [tags] {
    json { source => "message" target => "suricata" }
    
    if [suricata][event_type] == "alert" {
      mutate {
        add_field => {
          "event_type" => "ids_alert"
          "severity" => "high"
          "alert_signature" => "%{[suricata][alert][signature]}"
        }
      }
    }
  }
  
  # ─── Enrichissement commun ────────────────────────────────────────────────
  # Résolution DNS inverse
  dns {
    reverse => ["src_ip"]
    action => "append"
    nameserver => ["10.0.10.53"]
  }
  
  # Supprimer les champs temporaires
  mutate { remove_field => ["@version", "host_orig"] }
}

output {
  elasticsearch {
    hosts => ["https://10.0.10.200:9200"]
    index => "bcc-security-logs-%{+YYYY.MM.dd}"
    user => "logstash_writer"
    password => "${ELASTIC_PASSWORD}"
  }
  
  # Alertes critiques → fichier pour intégration ITSM
  if [severity] == "critical" {
    file {
      path => "/var/log/logstash/critical-alerts.json"
      codec => json_lines
    }
  }
}
```

---

## 3) Module — Kibana : Dashboards & Règles d'Alerte SIEM (2h)

### 📖 Narration/Intuition

Kibana est l'interface de visualisation de la stack ELK. Les analystes SOC y passent leurs journées : requêtes KQL pour investiguer un incident, dashboards de supervision en temps réel, règles de détection automatique (alertes). Un bon dashboard SIEM permet de détecter en secondes ce qui prendrait des heures à trouver manuellement.

### 🔍 Anatomie Technique

**Requêtes KQL (Kibana Query Language) :**

```
# Toutes les tentatives SSH échouées des dernières 24h
event_type: "ssh_failure" AND @timestamp > now-24h

# Brute force SSH : plus de 10 tentatives depuis la même IP
event_type: "ssh_failure" AND src_ip: *
# (Agrégation par src_ip avec count > 10)

# Connexions SSH depuis l'extérieur (IP non-RFC1918)
event_type: "ssh_success" AND NOT src_ip: (10.* OR 192.168.* OR 172.*)

# Alertes Suricata de haute sévérité
event_type: "ids_alert" AND suricata.alert.severity: (1 OR 2)

# Toutes les requêtes HTTP 5xx (erreurs serveur)
nginx.response: >=500

# Connexions vers des IPs géolocalisées hors Afrique Centrale
event_type: "ssh_success" AND NOT geoip.country_code2: (CD OR CG OR AO OR ZM OR TZ)

# Erreurs d'authentification PostgreSQL
message: "FATAL: password authentication failed" 

# Trafic vers des domaines suspects (DNS exfiltration)
dns.query.name: *.xyz OR dns.query.name: *.top OR dns.query.name: *.bit
```

**Règles de détection automatique (Kibana SIEM Rules) :**

```yaml
# Règle : Brute Force SSH
name: "BCC-SIEM-001 — Brute Force SSH Détecté"
description: "Plus de 10 tentatives SSH échouées en 5 minutes depuis la même IP"
type: threshold

index_patterns:
  - "bcc-security-logs-*"

query: |
  event_type: "ssh_failure"

threshold:
  field: "src_ip"
  value: 10
  cardinality:
    - field: "user"
      value: 3    # Sur au moins 3 utilisateurs différents = scan systématique

time_window: 5m    # Fenêtre de corrélation : 5 minutes

severity: high
risk_score: 75

actions:
  - type: email
    to: [soc@bcc.cd]
    subject: "[ALERTE P2] Brute Force SSH — {{context.src_ip}}"
  - type: webhook
    url: https://soc.bcc.cd/api/incidents    # Créer automatiquement un ticket
```

**Script de reporting quotidien SOC :**

```bash
#!/bin/bash
# rapport-soc-quotidien.sh — Rapport de sécurité journalier BCC
# Exécuté chaque matin à 6h00 via cron

ELASTIC_URL="https://10.0.10.200:9200"
HIER=$(date -d yesterday +%Y.%m.%d)
RAPPORT="/tmp/rapport-soc-$HIER.txt"

curl -s -u elastic:$ELASTIC_PASSWORD \
    "$ELASTIC_URL/bcc-security-logs-$HIER/_search" \
    -H "Content-Type: application/json" -d '{
  "size": 0,
  "aggs": {
    "echecs_ssh": {
      "filter": {"term": {"event_type": "ssh_failure"}},
      "aggs": { "total": {"value_count": {"field": "src_ip"}},
                "ips": {"terms": {"field": "src_ip", "size": 10}} }
    },
    "alertes_ids": {
      "filter": {"term": {"event_type": "ids_alert"}},
      "aggs": { "total": {"value_count": {"field": "_id"}},
                "signatures": {"terms": {"field": "alert_signature", "size": 5}} }
    }
  }
}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
aggs = data['aggregations']
print('=== RAPPORT SOC BCC — QUOTIDIEN ===')
print(f'Tentatives SSH échouées : {aggs[\"echecs_ssh\"][\"total\"][\"value\"]}')
print('Top IPs suspectes :')
for b in aggs['echecs_ssh']['ips']['buckets']:
    print(f'  {b[\"key\"]:20s} : {b[\"doc_count\"]} tentatives')
print(f'Alertes IDS : {aggs[\"alertes_ids\"][\"total\"][\"value\"]}')
" > $RAPPORT

# Envoyer le rapport par email
mail -s "[SOC BCC] Rapport sécurité du $HIER" soc@bcc.cd < $RAPPORT
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIEM** | Security Information and Event Management — gestion centralisée des événements de sécurité |
| **ELK** | Elasticsearch, Logstash, Kibana — stack de gestion de logs |
| **SOC** | Security Operations Center — centre opérationnel de sécurité |
| **KQL** | Kibana Query Language — langage de requête Kibana |
| **CEF** | Common Event Format — format de log standard sécurité |
| **IoC** | Indicator of Compromise — indicateur de compromission |
| **GROK** | Langage de parsing de patterns dans Logstash |
| **MTR** | Mean Time to Respond — temps moyen de réponse à un incident |
| **MTTD** | Mean Time to Detect — temps moyen de détection d'un incident |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Écrivez la requête KQL Kibana pour détecter toutes les connexions SSH réussies provenant d'IPs situées hors de la RDC (code pays `CD`) au cours des 7 derniers jours.

**Corrigé :** `event_type: "ssh_success" AND NOT geoip.country_code2: "CD" AND @timestamp > now-7d`

**Exercice 2 :** Expliquez la différence entre un IDS et un SIEM.

**Corrigé :** Un **IDS** (Intrusion Detection System) analyse le trafic réseau en temps réel pour détecter des signatures d'attaque connues et génère des alertes. Il est aveugle aux autres sources de données (logs applicatifs, logs auth...). Un **SIEM** collecte et corrèle des événements de **toutes les sources** (IDS, logs SSH, logs web, firewalls, AD) pour détecter des patterns d'attaque complexes qui traversent plusieurs systèmes — et maintient un historique long terme pour la forensique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un SIEM corrèle les événements de 50 serveurs. Quel scénario illustre la valeur ajoutée du SIEM par rapport à l'analyse individuelle des logs ?
- A) Un seul serveur qui plante — détecté par son propre log d'erreur
- B) Un attaquant qui fait 2 tentatives SSH sur chacun de 25 serveurs — invisible sur chaque serveur mais visible comme un pattern de brute force sur le SIEM
- C) Une mise à jour système réussie
- D) Un utilisateur qui se connecte normalement à son poste

**Réponse : B**

**Q2 :** Dans Logstash, le filtre `grok` sert à :
- A) Compresser les logs pour économiser de l'espace
- B) Parser des messages texte non structurés en champs structurés exploitables (IP, timestamp, code HTTP...)
- C) Chiffrer les logs avant stockage dans Elasticsearch
- D) Envoyer des alertes vers une messagerie externe

**Réponse : B**

**Q3 :** `@@` dans une configuration rsyslog (ex: `*.* @@10.0.10.100:514`) signifie :
- A) Envoi via UDP (sans accusé de réception)
- B) Envoi via TCP (avec accusé de réception — plus fiable)
- C) Envoi chiffré avec TLS
- D) Envoi vers deux serveurs simultanément

**Réponse : B** — `@` = UDP, `@@` = TCP.

**Q4 :** La géolocalisation d'IP dans un SIEM est utile pour :
- A) Améliorer les performances des requêtes Elasticsearch
- B) Détecter des connexions depuis des pays inhabituels ou inattendus (ex: connexion admin depuis un pays étranger)
- C) Chiffrer les adresses IP pour respecter le RGPD
- D) Résoudre automatiquement les conflits d'adressage IP

**Réponse : B**

**Q5 :** Le MTTR (Mean Time to Respond) est une métrique SOC qui mesure :
- A) Le temps moyen pour détecter un incident (de l'attaque à la première alerte)
- B) La durée moyenne entre la détection d'un incident et la résolution complète
- C) Le nombre moyen d'alertes par jour
- D) Le temps de réponse moyen des serveurs web

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
