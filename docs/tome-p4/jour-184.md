# TOME P4 — Cloud, DevOps & SecOps — Jour 184 (6h) : SIEM, SOC & Réponse aux Incidents (Splunk/ELK, Playbooks SOAR, Forensique Linux & Threat Hunting)

> [!NOTE]
> **Objectif du jour :** Comprendre l'organisation et les outils d'un **SOC (Security Operations Center)** moderne : architecture **SIEM (Security Information and Event Management)** avec Splunk/ELK Stack, automatisation de la réponse aux incidents via **SOAR (Security Orchestration, Automation and Response)**, **Playbooks** de réponse aux incidents, **Forensique Linux** post-incident, et techniques de **Threat Hunting** proactif.
>
> **Compétences visées :** `SEC-07` (A) — SOC & Réponse aux Incidents | `SEC-06` (A) — Forensique Linux & Threat Hunting

---

## 1) Module — Architecture SIEM & Détection Corrélée (2h)

### 📖 Narration/Intuition

La BCC génère des millions d'événements de sécurité par jour : logs de pare-feu, alertes IDS/IPS, logs d'authentification Active Directory, logs d'accès aux APIs, logs des serveurs PostgreSQL. Comment un analyste SOC peut-il identifier une attaque sophistiquée parmi des millions de lignes de logs en temps réel ?

Le **SIEM** centralise, corrèle et contextualise tous ces événements. Il transforme des logs bruts épars en **alertes de sécurité intelligentes** en détectant des patterns d'attaques qui ne seraient visibles que par la corrélation de sources multiples.

**Exemple de Corrélation SIEM :** Un utilisateur qui échoue 5 fois à l'authentification SSH (Brute-Force vu dans les logs système), puis réussit à se connecter depuis un pays inhabituel (géo-IP), et effectue ensuite une exportation massive de données (logs BDD) : 3 événements séparés qui, corrélés, révèlent une compromission de compte.

### 🔍 Anatomie Technique

**Architecture ELK Stack (Elasticsearch + Logstash + Kibana) pour la BCC :**

```
SOURCES DE LOGS BCC
  ├── Serveurs Linux (auditd, syslog, auth.log)
  ├── API Node.js (Winston JSON logs)
  ├── PostgreSQL (pg_audit)
  ├── NGFW Palo Alto (syslog)
  ├── Suricata IDS (EVE JSON)
  └── AWS CloudTrail (IAM Actions)
          │
          ▼ (Filebeat / Logstash Agents)
  ┌───────────────────┐
  │   LOGSTASH        │ ◄── Ingestion, Parsing, Enrichissement (GeoIP, Threat Intel)
  │   (ETL des Logs)  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  ELASTICSEARCH    │ ◄── Stockage, Indexation et Recherche Full-Text des Logs
  │  (Moteur de       │
  │   Recherche)      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │    KIBANA         │ ◄── Visualisation, Dashboards SOC, SIEM Rules, Alerting
  │  (Visualisation   │
  │  & Alertes SOC)   │
  └───────────────────┘
```

**Règle de Détection SIEM — Brute Force sur l'API BCC (KQL — Kibana Query Language) :**

```kql
// Règle : Détection de Brute Force sur /api/v1/login
// Condition : Plus de 10 tentatives de login en erreur 401 depuis la même IP en 5 minutes

event.dataset: "bcc-api" AND
http.request.method: "POST" AND
url.path: "/api/v1/login" AND
http.response.status_code: 401

// Agrégation : COUNT > 10 regroupé par source.ip sur window de 5 minutes
// Action : Générer une alerte CRITIQUE + déclencher le Playbook "BruteForce-Login"

// ───────────────────────────────────────────────────────────────────
// Règle : Détection d'un accès depuis une IP malveillante connue (Threat Intel)
// ───────────────────────────────────────────────────────────────────
event.dataset: "bcc-ngfw" AND
source.ip: (threat_intel_ips) AND  // Source : Feed VirusTotal, AbuseIPDB
network.direction: "inbound" AND
destination.port: 443
// Action : Blocage automatique IP + Alerte SOC + Investigation

// ───────────────────────────────────────────────────────────────────
// Règle : Possible Exfiltration de Données (Volume sortant anormal)
// ───────────────────────────────────────────────────────────────────
event.dataset: "bcc-api" AND
http.response.status_code: 200 AND
http.response.bytes > 1000000 AND   // Réponse > 1 MB (inhabituel pour l'API BCC)
NOT source.ip: $BCC_OFFICES_IPS     // Pas depuis les bureaux officiels BCC
// Action : Alerte + Gel du token d'accès + Investigation
```

---

## 2) Module — Playbooks SOAR & Réponse aux Incidents (2h)

### 📖 Narration/Intuition

Un **Playbook** de réponse aux incidents est un guide structuré et reproductible décrivant les étapes exactes à suivre pour contenir, éradiquer et récupérer d'un incident de sécurité spécifique (ex: Ransomware, Compromission de compte, Fuite de données). Le **SOAR** automatise l'exécution de ces playbooks.

### 🔍 Anatomie Technique

**Playbook — Réponse à un incident de Compromission de Compte BCC :**

```yaml
# PLAYBOOK : ACCOUNT_COMPROMISE_RESPONSE
# Version : 2.1 | Statut : APPROUVÉ | Propriétaire : SOC-BCC

playbook:
  name: "BCC-PLAY-001 — Réponse à la Compromission de Compte"
  trigger: "Alerte SIEM : Connexion depuis IP inconnue + MFA Bypass"
  severity: CRITIQUE
  sla_response: "15 minutes"

  phases:

    PHASE_1_CONTAINMENT: # Containment immédiat (< 5 minutes)
      automated: true
      actions:
        - action: "REVOKE_USER_SESSIONS"
          description: "Révoquer toutes les sessions actives et tokens JWT de l'utilisateur compromis"
          tool: "AWS Cognito API / Keycloak Admin API"
          
        - action: "DISABLE_USER_ACCOUNT"
          description: "Désactiver temporairement le compte dans l'Active Directory"
          tool: "PowerShell: Disable-ADAccount -Identity $userId"
          
        - action: "BLOCK_SOURCE_IP"
          description: "Bloquer l'IP source suspecte dans le NGFW et AWS Security Group"
          tool: "Palo Alto API + AWS EC2 SecurityGroup API"
          
        - action: "NOTIFY_ANALYST"
          description: "Notifier immédiatement l'analyste SOC de niveau 2 via Slack + PagerDuty"
          tool: "PagerDuty API (P1 incident)"

    PHASE_2_INVESTIGATION: # Analyse (15-60 minutes)
      manual: true
      actions:
        - "Collecter les logs des 24h précédant l'alerte (Splunk/ELK)"
        - "Analyser les accès API effectués par le compte compromis"
        - "Identifier les données potentiellement consultées ou exfiltrées"
        - "Déterminer le vecteur d'attaque initial (Phishing? Credential Stuffing?)"
        - "Vérifier si d'autres comptes du même groupe AD sont affectés"

    PHASE_3_ERADICATION:
      actions:
        - "Forcer la réinitialisation du mot de passe et MFA sur tous les systèmes"
        - "Révoquer et réémettre tous les tokens d'API de l'utilisateur"
        - "Scanner le poste de travail de l'utilisateur (EDR CrowdStrike)"

    PHASE_4_RECOVERY:
      actions:
        - "Réactiver le compte après validation de l'identité en présentiel avec la DRH"
        - "Activer la surveillance renforcée du compte pendant 30 jours"
        - "Informer l'utilisateur et son manager"

    PHASE_5_LESSONS_LEARNED:
      deadline: "72 heures"
      deliverable: "Rapport Post-Incident + Mise à jour des règles SIEM"
```

---

## 3) Module — Forensique Linux & Threat Hunting (2h)

### 📖 Narration/Intuition

Après la containment d'un incident, la **Forensique Numérique** consiste à reconstituer précisément ce que l'attaquant a fait sur le système compromis. Le **Threat Hunting** est l'activité proactive où les analystes SOC traquent des indicateurs de compromission qui ont **échappé aux détections automatisées**.

### 🛠️ Atelier Pratique

**Commandes Forensiques Linux pour l'investigation d'un serveur BCC compromis :**

```bash
# ════════════════════════════════════════════════════════
# PHASE 1 : SNAPSHOT MÉMOIRE & ÉTAT SYSTÈME AU MOMENT T
# (Ordre de volatilité : du plus volatile au moins volatile)
# ════════════════════════════════════════════════════════

# 1. Capturer la liste des processus en cours (Mémoire volatile — priorité max)
ps auxwf > /tmp/forensic/processes_$(date +%s).txt

# 2. Connexions réseau actives (Identifier les connexions C2 actives)
ss -tulpn > /tmp/forensic/network_connections_$(date +%s).txt
netstat -anp 2>/dev/null >> /tmp/forensic/network_connections_$(date +%s).txt

# 3. Utilisateurs connectés au moment de l'incident
who -a > /tmp/forensic/logged_users_$(date +%s).txt
last -50 > /tmp/forensic/recent_logins_$(date +%s).txt

# 4. Fichiers ouverts par les processus suspects
lsof -p $(pgrep -d, -x "suspicious_process") > /tmp/forensic/open_files.txt

# ════════════════════════════════════════════════════════
# PHASE 2 : ANALYSE DES LOGS D'AUTHENTIFICATION
# ════════════════════════════════════════════════════════

# Identifier toutes les connexions SSH réussies et échouées
grep -E "(Failed|Accepted)" /var/log/auth.log | \
  awk '{print $11, $13}' | sort | uniq -c | sort -rn | head -20

# Identifier les commandes exécutées avec sudo (Élévation de privilèges)
grep "sudo" /var/log/auth.log | grep -E "(COMMAND|session opened)"

# ════════════════════════════════════════════════════════
# PHASE 3 : RECHERCHE DE PERSISTANCE (Backdoors & Cron)
# ════════════════════════════════════════════════════════

# Lister toutes les tâches cron (Vecteur de persistance classique)
for user in $(cut -d: -f1 /etc/passwd); do
    echo "=== Cron de $user ==="; crontab -u $user -l 2>/dev/null
done

# Rechercher les fichiers SUID (Potentiel escalade de privilèges)
find / -perm -4000 -type f 2>/dev/null | sort

# Rechercher les fichiers créés/modifiés dans les 24 dernières heures
find /var /etc /usr/local -newer /tmp/reference_time -type f 2>/dev/null

# Vérifier l'intégrité des binaires système critiques (Rootkit Detection)
debsums -s 2>/dev/null  # Debian/Ubuntu
rpm -Va 2>/dev/null     # RHEL/CentOS

# ════════════════════════════════════════════════════════
# PHASE 4 : THREAT HUNTING — Indicateurs de Compromission (IoC)
# ════════════════════════════════════════════════════════

# Rechercher des connexions actives vers des IPs malveillantes connues (TI Feed)
ss -tnp | grep ESTABLISHED | awk '{print $5}' | cut -d: -f1 | \
  while read ip; do
    if grep -q "$ip" /tmp/malicious_ips.txt; then
      echo "🚨 CONNEXION C2 ACTIVE : $ip"
    fi
  done

# Détecter des processus masqués (Rootkit) — Comparaison PID /proc vs ps
comm -23 <(ls /proc | grep "^[0-9]" | sort -n) <(ps -e --no-headers -o pid= | sort -n)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIEM** | Security Information and Event Management — Centralisation et corrélation des logs de sécurité |
| **SOC** | Security Operations Center — Centre opérationnel de surveillance et de réponse aux incidents |
| **SOAR** | Security Orchestration, Automation and Response — Automatisation des réponses aux incidents de sécurité |
| **EDR** | Endpoint Detection and Response — Détection et réponse aux menaces sur les postes de travail |
| **IoC** | Indicator of Compromise — Indicateur technique (IP, hash, domaine) signalant une compromission |
| **TTPs** | Tactics, Techniques and Procedures — Méthodes comportementales d'un acteur de menace (Framework ATT&CK) |
| **DFIR** | Digital Forensics and Incident Response — Forensique Numérique et Réponse aux Incidents |
| **ELK** | Elasticsearch, Logstash, Kibana — Stack open-source de centralisation et visualisation des logs |
| **KQL** | Kibana Query Language — Langage de requête de Kibana SIEM |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le principe de la **corrélation de logs dans un SIEM** et donner un exemple concret d'une attaque qui serait **invisible** à l'analyse d'un seul log mais détectable par la corrélation de plusieurs sources.

**Corrigé :** La **corrélation de logs** consiste à combiner des événements provenant de sources différentes et à les analyser ensemble dans une fenêtre de temps pour identifier des patterns d'attaque qui ne seraient pas apparents dans un seul log. Exemple d'attaque corrélée — **Password Spray suivi d'une exfiltration** : (1) **Log NGFW** : 500 tentatives d'authentification depuis une IP externe (une par compte, lent — 1 essai/10 min — pour éviter le rate-limiting). (2) **Log Active Directory** : Une connexion réussie pour l'utilisateur "kabilaj" depuis l'IP suspecte. (3) **Log API BCC** : L'utilisateur "kabilaj" effectue 200 requêtes `GET /api/v1/accounts/*/transactions` en 30 secondes (énumération des comptes). (4) **Log BDD** : Export d'une table complète via l'API. Chacun de ces 4 événements, pris isolément, peut sembler bénin. Corrélés par le SIEM sur une fenêtre de 2 heures, ils révèlent une attaque sophistiquée en 4 étapes.

**Exercice 2 :** Pourquoi est-il critique de respecter l'**ordre de volatilité** lors d'une investigation forensique sur un serveur Linux compromis ?

**Corrigé :** L'**ordre de volatilité** stipule que les données numériques d'un système ont des durées de vie radicalement différentes. Les données les plus **volatiles** (RAM, connexions réseau actives, processus en cours) disparaissent définitivement à l'extinction du serveur ou au reboot. Les données **moins volatiles** (logs disque, système de fichiers) persistent mais peuvent être altérées par les actions d'investigation. Le respect de l'ordre de volatilité (RAM → Réseau → Processus → Disque → Logs → Sauvegardes) garantit que les preuves les plus fragiles et les plus précieuses (ex: une connexion C2 active en mémoire, les clés de session du malware en RAM) sont capturées en priorité avant qu'elles ne disparaissent. Capturer les logs disque en premier pendant qu'un processus malveillant est encore en cours d'effacement de traces serait une erreur forensique grave.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la fonction principale d'un **SIEM (Security Information and Event Management)** dans un SOC ?
- A) Centraliser, normaliser et corréler des événements de sécurité de sources multiples pour détecter des attaques complexes invisibles à l'analyse individuelle
- B) Bloquer le trafic réseau malveillant
- C) Chiffrer les données sensibles de l'entreprise
- D) Gérer les identités et les mots de passe

**Réponse : A**

**Q2 :** Qu'est-ce qu'un **Playbook** de réponse aux incidents dans le contexte SOAR d'un SOC bancaire ?
- A) Un guide structuré et reproductible définissant les étapes précises (containment, investigation, éradication, recovery) à suivre pour un type d'incident spécifique
- B) Un carnet de bord manuscrit de l'analyste
- C) Un script de déploiement automatique de l'infrastructure
- D) Un guide de configuration du NGFW

**Réponse : A**

**Q3 :** Dans le cadre de la Forensique Numérique Linux, pourquoi les connexions réseau actives (via `ss -tulpn`) doivent-elles être capturées en priorité absolue sur les logs disque ?
- A) Car elles sont en mémoire volatile : elles disparaissent définitivement à l'extinction du serveur, pouvant ainsi faire perdre des preuves de connexions C2 actives
- B) Car les logs disque sont inutiles pour une investigation
- C) Car les connexions réseau sont plus faciles à analyser
- D) Car les logs disque sont toujours chiffrés

**Réponse : A**

**Q4 :** Qu'est-ce que le **Threat Hunting** dans un SOC, et en quoi diffère-t-il fondamentalement de la détection basée sur des règles SIEM ?
- A) Le Threat Hunting est une démarche proactive où des analystes experts traquent des menaces avancées (APT) qui ont délibérément contourné les détections automatisées, en s'appuyant sur des hypothèses et le framework ATT&CK, pas uniquement sur des règles prédéfinies
- B) Threat Hunting est un autre nom pour le SIEM automatisé
- C) Threat Hunting consiste à scanner les ports des serveurs externes
- D) Threat Hunting est réservé aux équipes Red Team uniquement

**Réponse : A**

**Q5 :** Quel fichier Linux est analysé en priorité pour identifier les tentatives de connexion SSH réussies et échouées lors d'une investigation forensique ?
- A) `/var/log/auth.log` (Debian/Ubuntu) ou `/var/log/secure` (RHEL/CentOS)
- B) `/etc/passwd`
- C) `/var/log/syslog` uniquement
- D) `/tmp/logs`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
