# SEMESTRE 1 — Jour 43 (6h) : Monitoring & Supervision d'Infrastructure avec Prometheus & Grafana

> [!NOTE]
> **Objectif de la journée** : Déployer et exploiter un stack de supervision professionnel (Prometheus + Node Exporter + Grafana) pour surveiller l'état de santé d'un système Linux en temps réel, analyser les métriques et configurer des alertes.
> **Compétences visées** : `POL-03` (Niveau Cible: A) — Surveillance, Supervision IT & Observabilité.

---

## 1) L'Observabilité Moderne : Les 3 Piliers (1h30)

### 📖 1.1 Narration & Intuition — Le Tableau de Bord du Pilote

Un pilote d'avion ne ferme pas les yeux et n'espère pas que l'appareil atterrira seul. Il surveille en permanence des centaines d'indicateurs : altitude, vitesse, niveau de carburant, pression cabine. Chaque anomalie déclenche une alerte immédiate.

Administrer une infrastructure sans monitoring, c'est piloter à l'aveugle. Les systèmes tombent sans prévenir, des goulots d'étranglement se forment silencieusement, et vous n'apprenez la panne qu'en recevant l'appel furieux du directeur général à 3h du matin.

L'**observabilité** moderne repose sur 3 piliers complémentaires :

```
┌──────────────────────────────────────────────────────────────────┐
│             LES 3 PILIERS DE L'OBSERVABILITÉ                     │
├─────────────────┬──────────────────┬────────────────────────────┤
│  📊 MÉTRIQUES   │  📋 LOGS         │  🔗 TRACES DISTRIBUÉES     │
│  (Metrics)      │                  │  (Tracing)                 │
├─────────────────┼──────────────────┼────────────────────────────┤
│ Chiffres dans   │ Événements       │ Suivi d'une requête à      │
│ le temps        │ textuels         │ travers des microservices  │
├─────────────────┼──────────────────┼────────────────────────────┤
│ Prometheus      │ ELK Stack        │ Jaeger, Zipkin             │
│ Grafana         │ Loki             │ OpenTelemetry              │
│ Datadog         │ Splunk           │ AWS X-Ray                  │
├─────────────────┼──────────────────┼────────────────────────────┤
│ "CPU à 95%"     │ "ERROR: connexion│ "La requête /api/checkout  │
│                 │ refusée"         │ a pris 2.3s dans DB"       │
└─────────────────┴──────────────────┴────────────────────────────┘
```

### 🔍 1.2 Anatomie Technique — Prometheus

**Prometheus** est un système de monitoring open source créé par SoundCloud (2012), maintenant sous l'égide de la CNCF (Cloud Native Computing Foundation).

Architecture Prometheus :
```
┌─────────────────┐   HTTP Pull (scrape)   ┌──────────────────┐
│   Prometheus    │ ──────────────────────►│  Node Exporter   │
│   (serveur)     │◄── métriques (texte)── │  (sur le serveur │
│                 │                        │   à surveiller)  │
│  Stockage TSDB  │                        └──────────────────┘
│  (Time Series   │
│   Database)     │   Requêtes PromQL      ┌──────────────────┐
│                 │◄──────────────────────►│    Grafana       │
│                 │                        │  (Dashboards)    │
└─────────────────┘                        └──────────────────┘
         │
         │ Alertes (règles PromQL)
         ▼
┌─────────────────┐
│ AlertManager    │──► Email, Slack, PagerDuty
└─────────────────┘
```

**Modèle Pull vs Push :**
- **Pull** (Prometheus) : Prometheus va chercher les métriques sur chaque cible toutes les 15 secondes. Avantage : centralisation, détection des cibles DOWN.
- **Push** (InfluxDB, StatsD) : Les cibles envoient leurs métriques au serveur. Avantage : pour les jobs batch éphémères.

### 🛠️ 1.3 Atelier Pratique — Déployer Node Exporter

```bash
# Méthode 1 : Via Docker (recommandé pour les labs)
# Lancement de Node Exporter — expose les métriques système Linux
docker run -d \
  --name node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  quay.io/prometheus/node-exporter:latest \
  --path.rootfs=/host

# Vérification que Node Exporter est actif
docker ps | grep node-exporter
# Output attendu: node-exporter ... quay.io/prometheus/node-exporter ...

# Vérifier les métriques exposées
curl http://localhost:9100/metrics | head -30
# Output attendu: # HELP node_cpu_seconds_total ...
# node_cpu_seconds_total{cpu="0",mode="idle"} 12345.67

# Métriques clés à surveiller :
curl http://localhost:9100/metrics | grep -E "^(node_cpu|node_memory|node_disk|node_filesystem)" | head -20
```

---

## 2) Prometheus : Configuration et PromQL (1h30)

### 📖 2.1 Configuration de Prometheus

```yaml
# Créer le fichier de configuration Prometheus
cat > /tmp/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s      # Fréquence de collecte des métriques
  evaluation_interval: 15s   # Fréquence d'évaluation des règles d'alerte

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']  # Prometheus se monitore lui-même

  - job_name: 'node-linux'
    static_configs:
      - targets: ['localhost:9100']  # Notre Node Exporter

# Règles d'alerte
rule_files:
  - "alert_rules.yml"
EOF

# Lancer Prometheus avec cette configuration
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /tmp/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest

# Accéder à l'interface web : http://localhost:9090
echo "Interface Prometheus disponible sur : http://localhost:9090"
```

### 🔍 2.2 PromQL — Requêtes pour Analyser vos Métriques

PromQL (Prometheus Query Language) est le langage de requêtes de Prometheus. Voici les requêtes essentielles :

```bash
# Via l'interface web Prometheus (http://localhost:9090/graph)
# ou via l'API HTTP :

# 1. Utilisation CPU instantanée (tous les cœurs)
curl -s 'http://localhost:9090/api/v1/query?query=node_cpu_seconds_total' | \
  python3 -m json.tool | head -20

# Requêtes PromQL utiles (à taper dans l'interface Prometheus) :

# CPU utilisé en % (moyenne sur 5 minutes)
# 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Mémoire utilisée en %
# (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Espace disque utilisé sur /
# (1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100

# Débit réseau reçu (bytes/sec)
# irate(node_network_receive_bytes_total[5m])
```

---

## 3) Grafana : Dashboards Professionnels (2h)

### 📖 3.1 Déployer Grafana

```bash
# Lancer Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=paradis2024 \
  grafana/grafana:latest

echo "Interface Grafana disponible sur : http://localhost:3000"
echo "Login: admin / paradis2024"

# Vérifier que Grafana est actif
curl -s http://localhost:3000/api/health | python3 -m json.tool
# Output attendu: {"commit":"...","database":"ok","version":"10.x.x"}
```

### 🔍 3.2 Configurer la Source de Données Prometheus

```bash
# Ajouter Prometheus comme datasource via l'API Grafana
curl -s -X POST \
  -H "Content-Type: application/json" \
  -u admin:paradis2024 \
  http://localhost:3000/api/datasources \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "http://localhost:9090",
    "access": "proxy",
    "isDefault": true
  }'
# Output attendu: {"datasource":{"id":1,"uid":"...","name":"Prometheus",...}}
```

### 🔍 3.3 Importer un Dashboard Node Exporter Standard

Le dashboard officiel Node Exporter Full (ID: **1860**) est la référence industrie :

```bash
# Importer le dashboard via l'API
curl -s -X POST \
  -H "Content-Type: application/json" \
  -u admin:paradis2024 \
  http://localhost:3000/api/dashboards/import \
  -d '{"dashboardId":1860,"overwrite":true,"inputs":[{"name":"DS_PROMETHEUS","type":"datasource","pluginId":"prometheus","value":"Prometheus"}]}'

echo "Dashboard importé ! Accédez à http://localhost:3000/dashboards"
```

### 🛠️ 3.4 Configurer une Alerte Critique

```yaml
# Créer un fichier de règles d'alerte Prometheus
cat > /tmp/alert_rules.yml << 'EOF'
groups:
  - name: infrastructure_critique
    interval: 30s
    rules:
      # Alerte si CPU > 90% pendant 5 minutes
      - alert: CPU_Critique
        expr: 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "CPU critique sur {{ $labels.instance }}"
          description: "CPU à {{ $value }}% depuis 5 minutes"

      # Alerte si espace disque > 85%
      - alert: DiskSpace_Critique
        expr: (1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100 > 85
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Disque plein sur {{ $labels.instance }}"
          description: "Disque / utilisé à {{ $value }}%"

      # Alerte si RAM disponible < 10%
      - alert: RAM_Critique
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 10
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "RAM critique sur {{ $labels.instance }}"
EOF

echo "Règles d'alerte créées dans /tmp/alert_rules.yml"
```

---

## 4) Audit de Sécurité & Conformité (1h)

### 🔍 4.1 Commandes d'Audit Sécurité Essentielles

```bash
# Audit basique de permissions sensibles (fichiers SUID — vecteur d'escalade de privilèges)
find / -perm -4000 -type f 2>/dev/null
# Output attendu: /usr/bin/sudo, /usr/bin/passwd, /usr/bin/su, etc.
# Comparer avec la liste normale — tout binaire SUID inconnu est suspect

# Vérifier la configuration SSH (sécurité basique)
grep -E "^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|Port)" /etc/ssh/sshd_config
# Output souhaité:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Ports en écoute — surface d'attaque
sudo ss -tlnp
# Identifier tout port inattendu

# Utilisateurs avec mot de passe vide (critique!)
sudo awk -F: '$2 == "" {print "ALERTE: Utilisateur sans mot de passe:", $1}' /etc/shadow 2>/dev/null

# Tentatives de connexion SSH échouées (attaques brute force)
sudo grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -10
# Output: Nombre de tentatives par IP — les IPs les plus actives sont des attaquants
```

### 🚑 4.2 Diagnostic & Réflexes Terrain

**Problème : L'alerte CPU déclenche à faux (faux positifs)**
```bash
# Identifier le processus responsable du pic CPU
# Dans l'interface htop, trier par %CPU (touche F6 → CPU%)
htop

# Ou en ligne de commande
ps aux --sort=-%cpu | head -10
# Si c'est updatedb, cron ou dpkg → normal
# Si c'est un processus inconnu → ALERTE SÉCURITÉ

# Analyser la charge système détaillée
vmstat 1 10    # 10 mesures toutes les secondes
# Colonne "us" = user space | "sy" = kernel | "wa" = I/O wait
# Si "wa" > 20% → goulot d'étranglement disque
```

---

## ⚠️ Erreurs Fréquentes & Debugging

> [!WARNING]
> **Erreur #1 : Ne surveiller que le CPU et ignorer le I/O wait**
> Un serveur peut avoir 20% de CPU mais 80% de temps passé à attendre les disques (I/O wait). Toujours monitorer CPU, RAM, Disk I/O ET Network simultanément.

> [!WARNING]
> **Erreur #2 : Alertes trop sensibles (alert fatigue)**
> Si chaque pic de CPU de 30 secondes génère une alerte, les équipes finissent par les ignorer. Configurer des seuils avec des délais (`for: 5m`) pour n'alerter sur des problèmes réels.

> [!TIP]
> **Bonne pratique : Le Dashboard de Santé Quotidien**
> Commencez chaque matinée par 2 minutes sur le dashboard Grafana. Identifiez les tendances (croissance lente du disque, pic de RAM la nuit) avant qu'elles deviennent des pannes.

---

## ❓ Banque de QCM — Test du Jour (8 Questions)

**Q1 : Quels sont les 3 piliers de l'observabilité moderne ?**
- A) CPU, RAM, Disque
- B) Métriques, Logs, Traces distribuées
- C) Prometheus, Grafana, AlertManager
- D) Monitoring, Alerting, Reporting

*Réponse : B — Les 3 piliers de l'observabilité sont les Métriques (chiffres dans le temps), les Logs (événements textuels) et les Traces distribuées (suivi des requêtes entre services).*

**Q2 : Quelle est la différence entre le modèle Pull et Push en monitoring ?**
- A) Pull = les cibles envoient les métriques, Push = le serveur les collecte
- B) Pull = le serveur Prometheus va chercher les métriques sur les cibles, Push = les cibles envoient au serveur
- C) Il n'y a aucune différence fonctionnelle
- D) Pull est pour les logs, Push pour les métriques

*Réponse : B — Prometheus utilise le modèle Pull : il interroge activement chaque cible (node exporter) toutes les 15 secondes pour collecter les métriques.*

**Q3 : Sur quel port Node Exporter expose-t-il ses métriques par défaut ?**
- A) 3000
- B) 8080
- C) 9090
- D) 9100

*Réponse : D — Node Exporter écoute sur le port 9100 par défaut. Prometheus écoute sur 9090, Grafana sur 3000.*

**Q4 : Que signifie le terme "scrape interval" dans la configuration Prometheus ?**
- A) La durée de rétention des données
- B) L'intervalle de temps entre deux collectes de métriques par Prometheus
- C) La fréquence de rafraîchissement de Grafana
- D) Le délai d'expiration des alertes

*Réponse : B — Le `scrape_interval` définit à quelle fréquence Prometheus interroge chaque cible pour collecter les métriques (défaut : 15 secondes).*

**Q5 : Quelle commande permet de voir les processus consommant le plus de CPU en temps réel ?**
- A) `top` ou `htop`
- B) `ps aux`
- C) `vmstat`
- D) `iostat`

*Réponse : A — `top` et `htop` affichent les processus en temps réel triés par utilisation CPU. `htop` est la version améliorée et interactive.*

**Q6 : Qu'est-ce qu'un fichier SUID et pourquoi est-il important en sécurité ?**
- A) Un fichier chiffré qui protège les données sensibles
- B) Un binaire qui s'exécute avec les permissions de son propriétaire (souvent root), vecteur potentiel d'escalade de privilèges
- C) Un fichier de configuration système standard
- D) Un journal de log sécurisé

*Réponse : B — Les fichiers SUID (Set User ID) s'exécutent avec les droits de leur propriétaire. Un binaire SUID root mal sécurisé peut permettre à n'importe quel utilisateur d'obtenir les droits root.*

**Q7 : Quel est l'ID du dashboard Grafana officiel "Node Exporter Full" utilisé dans l'industrie ?**
- A) 42
- B) 1860
- C) 3000
- D) 9090

*Réponse : B — Le dashboard "Node Exporter Full" avec l'ID 1860 est la référence industrie pour superviser des serveurs Linux avec Prometheus/Grafana.*

**Q8 : Pourquoi configurer un délai (`for: 5m`) dans les règles d'alerte Prometheus ?**
- A) Pour retarder les alertes et éviter de surcharger le réseau
- B) Pour éviter les faux positifs sur des pics temporaires normaux et ne déclencher des alertes que sur des problèmes persistants
- C) C'est une exigence légale du RGPD
- D) Pour permettre à Prometheus de sauvegarder les données avant d'alerter

*Réponse : B — Le délai `for: 5m` signifie que la condition doit être vraie pendant 5 minutes consécutives avant de déclencher l'alerte, évitant les faux positifs sur des pics momentanés.*

---

## 📚 Ressources & Références

- **Prometheus Documentation** : https://prometheus.io/docs/introduction/overview/
- **Grafana Getting Started** : https://grafana.com/docs/grafana/latest/getting-started/
- **Node Exporter Dashboard (ID 1860)** : https://grafana.com/grafana/dashboards/1860
- **PromQL Cheat Sheet** : https://promlabs.com/promql-cheat-sheet/
- **Google SRE Book — Monitoring** : https://sre.google/sre-book/monitoring-distributed-systems/

---

*Semestre 1 — Socle Système Linux & Administration PARADIS IT Masterclass*
